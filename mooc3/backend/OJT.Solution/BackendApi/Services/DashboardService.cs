using System;
using System.Linq;
using System.Threading.Tasks;
using BackendApi.Dtos;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly OjtDbContext _context;
        public DashboardService(OjtDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var totalBooks = await _context.Books.CountAsync();
            var booksBorrowed = await _context.Borrows.Where(b => b.ReturnDate == null && b.Status == "borrowed").CountAsync();
            var booksAvailable = totalBooks - booksBorrowed;

            var totalUsers = await _context.Users.CountAsync();
            var adminCount = await _context.Users.CountAsync(u => u.Role != null && u.Role.ToLower() == "admin");
            var staffCount = await _context.Users.CountAsync(u => u.Role != null && u.Role.ToLower() == "staff");
            var userCount = await _context.Users.CountAsync(u => u.Role != null && u.Role.ToLower() == "user");

            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Unspecified);
            var borrowsToday = await _context.Borrows.CountAsync(b => b.BorrowDate.Date == today);
            var weekStart = DateTime.SpecifyKind(today.AddDays(-(int)today.DayOfWeek), DateTimeKind.Unspecified);
            var borrowsThisWeek = await _context.Borrows.CountAsync(b => b.BorrowDate.Date >= weekStart);
            var monthStart = DateTime.SpecifyKind(new DateTime(today.Year, today.Month, 1), DateTimeKind.Unspecified);
            var borrowsThisMonth = await _context.Borrows.CountAsync(b => b.BorrowDate.Date >= monthStart);

            // Lấy top categoryId và count từ DB
            var topCategoryGroups = await _context.Books
                .GroupBy(b => b.CategoryId)
                .Select(g => new { CategoryId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // Join với Category để lấy tên
            var topCategories = topCategoryGroups
                .Join(_context.Categories,
                    g => g.CategoryId,
                    c => c.Id,
                    (g, c) => new TopCategoryDto
                    {
                        Category = c.Name,
                        Count = g.Count
                    })
                .ToList();

            // Lấy top bookId và count từ DB
            var topBookGroups = await _context.Borrows
                .GroupBy(b => b.BookId)
                .Select(g => new { BookId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // Join với Book để lấy tên
            var topBooks = topBookGroups
                .Join(_context.Books,
                    g => g.BookId,
                    b => b.Id,
                    (g, b) => new TopBookDto
                    {
                        Title = b.Title,
                        BorrowCount = g.Count
                    })
                .ToList();

            return new DashboardStatsDto
            {
                TotalBooks = totalBooks,
                BooksBorrowed = booksBorrowed,
                BooksAvailable = booksAvailable,
                TotalUsers = totalUsers,
                AdminCount = adminCount,
                StaffCount = staffCount,
                UserCount = userCount,
                BorrowsToday = borrowsToday,
                BorrowsThisWeek = borrowsThisWeek,
                BorrowsThisMonth = borrowsThisMonth,
                TopCategories = topCategories,
                TopBooks = topBooks
            };
        }
        
        public async Task<StaffDashboardStatsDto> GetStaffDashboardStatsAsync()
        {
            var booksBorrowed = await _context.Borrows.CountAsync(b => b.ReturnDate == null && b.Status.ToLower() == "borrowed");

            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Unspecified);
            var borrowsToday = await _context.Borrows.CountAsync(b => b.BorrowDate.Date == today);
            var weekStart = DateTime.SpecifyKind(today.AddDays(-(int)today.DayOfWeek), DateTimeKind.Unspecified);
            var borrowsThisWeek = await _context.Borrows.CountAsync(b => b.BorrowDate.Date >= weekStart);
            var monthStart = DateTime.SpecifyKind(new DateTime(today.Year, today.Month, 1), DateTimeKind.Unspecified);
            var borrowsThisMonth = await _context.Borrows.CountAsync(b => b.BorrowDate.Date >= monthStart);

            var activeUsers = await _context.Borrows
                .Where(b => b.ReturnDate == null && b.Status.ToLower() == "borrowed")
                .Select(b => b.UserId)
                .Distinct()
                .CountAsync();

            var topBookGroups = await _context.Borrows
                .GroupBy(b => b.BookId)
                .Select(g => new { BookId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            var topBooks = topBookGroups
                .Join(_context.Books,
                    g => g.BookId,
                    b => b.Id,
                    (g, b) => new TopBookDto
                    {
                        Title = b.Title,
                        BorrowCount = g.Count
                    })
                .ToList();

            return new StaffDashboardStatsDto
            {
                BooksBorrowed = booksBorrowed,
                BorrowsToday = borrowsToday,
                BorrowsThisWeek = borrowsThisWeek,
                BorrowsThisMonth = borrowsThisMonth,
                ActiveUsers = activeUsers,
                TopBooks = topBooks
            };
        }

        public async Task<UserDashboardStatsDto> GetUserDashboardStatsAsync(int userId)
        {
            var totalBorrowed = await _context.Borrows.CountAsync(b => b.UserId == userId);
            var currentlyBorrowing = await _context.Borrows.CountAsync(b => b.UserId == userId && b.ReturnDate == null && b.Status.ToLower() == "borrowed");
            var returnedBooks = await _context.Borrows.CountAsync(b => b.UserId == userId && b.ReturnDate != null);

            var borrowHistory = await _context.Borrows
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BorrowDate)
                .Select(b => new UserBookHistoryDto
                {
                    Title = b.Book.Title,
                    Status = b.Status,
                    BorrowDate = b.BorrowDate.ToString("yyyy-MM-dd"),
                    ReturnDate = b.ReturnDate.HasValue ? b.ReturnDate.Value.ToString("yyyy-MM-dd") : null
                })
                .Take(10)
                .ToListAsync();

            var topBookGroups = await _context.Borrows
                .GroupBy(b => b.BookId)
                .Select(g => new { BookId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            var suggestedBooks = topBookGroups
                .Join(_context.Books,
                    g => g.BookId,
                    b => b.Id,
                    (g, b) => new TopBookDto
                    {
                        Title = b.Title,
                        BorrowCount = g.Count
                    })
                .ToList();

            return new UserDashboardStatsDto
            {
                TotalBorrowed = totalBorrowed,
                CurrentlyBorrowing = currentlyBorrowing,
                ReturnedBooks = returnedBooks,
                BorrowHistory = borrowHistory,
                SuggestedBooks = suggestedBooks
            };
        }
    }
}
