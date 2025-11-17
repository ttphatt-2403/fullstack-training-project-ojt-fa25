using BackendApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Services
{
    public class BookQuantitySyncService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookQuantitySyncService> _logger;
        private readonly TimeSpan _syncInterval = TimeSpan.FromHours(1); // Chạy mỗi 1 tiếng

        public BookQuantitySyncService(
            IServiceProvider serviceProvider,
            ILogger<BookQuantitySyncService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Chạy sync đầu tiên khi startup (sau 30 giây)
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SyncBookQuantities();
                    _logger.LogInformation("✅ Book quantities sync completed at {Time}", DateTime.Now);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error during book quantities sync at {Time}", DateTime.Now);
                }

                // Chờ đến lần sync tiếp theo
                await Task.Delay(_syncInterval, stoppingToken);
            }
        }

        private async Task SyncBookQuantities()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<OjtDbContext>();

            try
            {
                var totalSynced = 0;
                var books = await context.Books.ToListAsync();

                foreach (var book in books)
                {
                    // Tính số sách đang được mượn hoặc đang chờ duyệt
                    var borrowedOrRequestedCount = await context.Borrows
                        .CountAsync(b => b.BookId == book.Id && 
                                       (b.Status == "borrowed" || b.Status == "request"));

                    // Tính số sách có sẵn thực tế
                    var actualAvailable = Math.Max(0, (book.TotalCopies ?? 0) - borrowedOrRequestedCount);
                    var currentAvailable = book.AvailableCopies ?? 0;

                    // Chỉ update nếu khác với giá trị hiện tại
                    if (actualAvailable != currentAvailable)
                    {
                        _logger.LogInformation(
                            "🔄 SYNC Book ID {BookId}: {OldAvailable} → {NewAvailable} (Total: {Total}, Borrowed: {Borrowed})",
                            book.Id, currentAvailable, actualAvailable, book.TotalCopies, borrowedOrRequestedCount
                        );
                        
                        book.AvailableCopies = actualAvailable;
                        book.Updatedat = DateTime.Now;
                        totalSynced++;
                    }
                }

                if (totalSynced > 0)
                {
                    await context.SaveChangesAsync();
                    _logger.LogInformation("📊 Synced {Count} books with incorrect quantities", totalSynced);
                }
                else
                {
                    _logger.LogDebug("📊 All book quantities are already correct");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in SyncBookQuantities");
                throw;
            }
        }

        public async Task TriggerManualSync()
        {
            try
            {
                await SyncBookQuantities();
                _logger.LogInformation("✅ Manual book quantities sync completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error during manual book quantities sync");
                throw;
            }
        }
    }
}