using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using BackendApi.Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BorrowController : ControllerBase
    {
        private readonly OjtDbContext _context;
        private readonly IServiceProvider _serviceProvider;

        public BorrowController(OjtDbContext context, IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
        }

        // ==========================================
        // GET: api/Borrow
        // ==========================================
        [HttpGet]
        public async Task<ActionResult<object>> GetBorrows([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 20; // Tăng default pageSize cho performance tốt hơn
            if (pageSize > 100) pageSize = 100; // Giới hạn tối đa để tránh timeout

            // Don't use Include to avoid navigation property issues
            var query = _context.Borrows.AsQueryable();

            // Lọc theo status nếu có
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b => b.Status == status);
            }

            query = query.OrderByDescending(b => b.BorrowDate);

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

            // Get borrow IDs for this page first
            var borrowIds = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => b.Id)
                .ToListAsync();

            // Get detailed borrow data with user and book info using separate queries
            var borrowData = await _context.Borrows
                .Where(b => borrowIds.Contains(b.Id))
                .OrderByDescending(b => b.BorrowDate)
                .ToListAsync();

            // Get user and book info separately
            var userIds = borrowData.Select(b => b.UserId).Distinct().ToList();
            var bookIds = borrowData.Select(b => b.BookId).Distinct().ToList();

            var users = await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, Username = u.Fullname ?? u.Username })
                .ToListAsync();

            var books = await _context.Books
                .Where(b => bookIds.Contains(b.Id))
                .Select(b => new { b.Id, b.Title })
                .ToListAsync();

            // Combine data
            var borrows = borrowData.Select(b => new
            {
                b.Id,
                b.UserId,
                b.BookId,
                b.BorrowDate,
                b.DueDate,
                b.ReturnDate,
                b.Status,
                b.Notes,
                b.Createdat,
                UserName = users.FirstOrDefault(u => u.Id == b.UserId)?.Username ?? "Unknown User",
                BookTitle = books.FirstOrDefault(bk => bk.Id == b.BookId)?.Title ?? "Unknown Book"
            }).ToList();
            return Ok(new
            {
                data = borrows,
                pageNumber,
                pageSize,
                totalRecords,
                totalPages
            });
        }

        // ==========================================
        // GET: api/Borrow/{id}
        // ==========================================
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBorrow(int id)
        {
            var borrow = await _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                    .ThenInclude(book => book.Category)
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    b.BookId,
                    b.BorrowDate,
                    b.DueDate,
                    b.ReturnDate,
                    b.Status,
                    b.Notes,
                    User = new
                    {
                        b.User.Id,
                        b.User.Username,
                        b.User.Fullname,
                        b.User.Email,
                        b.User.Phone
                    },
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        b.Book.Isbn,
                        Category = new
                        {
                            b.Book.Category.Id,
                            b.Book.Category.Name
                        }
                    },
                    b.Createdat,
                    b.Updatedat
                })
                .FirstOrDefaultAsync();

            if (borrow == null)
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });

            return Ok(borrow);
        }

        // ==========================================
        // GET: api/Borrow/{id}/details - Chi tiết phiếu mượn với đầy đủ thông tin
        // ==========================================
        [HttpGet("{id}/details")]
        public async Task<ActionResult<object>> GetBorrowDetails(int id)
        {
            var borrow = await _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                    .ThenInclude(book => book.Category)
                .Include(b => b.Fees) // Include fees nếu có
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    b.BookId,
                    b.BorrowDate,
                    b.DueDate,
                    b.ReturnDate,
                    b.Status,
                    b.Notes,
                    DaysOverdue = b.Status == "borrowed" && b.DueDate < DateTime.Now
                        ? (DateTime.Now - b.DueDate).Days
                        : (int?)null,
                    DaysBorrowed = b.ReturnDate.HasValue
                        ? (b.ReturnDate.Value - b.BorrowDate).Days
                        : (DateTime.Now - b.BorrowDate).Days,
                    User = new
                    {
                        b.User.Id,
                        b.User.Username,
                        b.User.Fullname,
                        b.User.Email,
                        b.User.Phone,
                        b.User.Role,
                        b.User.Isactive
                    },
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        b.Book.Isbn,
                        b.Book.Publisher,
                        b.Book.TotalCopies,
                        b.Book.AvailableCopies,
                        Category = new
                        {
                            b.Book.Category.Id,
                            b.Book.Category.Name
                        }
                    },
                    Fees = b.Fees.Select(f => new
                    {
                        f.Id,
                        f.Amount,
                        f.Type,
                        f.Status,
                        f.PaymentMethod,
                        f.CreatedAt,
                        f.PaidAt,
                        f.Notes
                    }).ToList(),
                    b.Createdat,
                    b.Updatedat
                })
                .FirstOrDefaultAsync();

            if (borrow == null)
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });

            return Ok(borrow);
        }

        // ==========================================
        // GET: api/Borrow/user/{userId}
        // ==========================================
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<object>> GetBorrowsByUser(int userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
                return NotFound(new { message = "User không tồn tại." });

            var currentDate = DateTime.Now;
            var query = _context.Borrows
                .Include(b => b.Book)
                    .ThenInclude(book => book.Category)
                .Include(b => b.Fees)
                .Where(b => b.UserId == userId);

            // Apply status filter
            if (!string.IsNullOrEmpty(status))
            {
                switch (status.ToLower())
                {
                    case "borrowed":
                        query = query.Where(b => b.Status == "borrowed");
                        break;
                    case "returned":
                        query = query.Where(b => b.Status == "returned");
                        break;
                    case "overdue":
                        query = query.Where(b => b.Status == "borrowed" && b.DueDate < currentDate);
                        break;
                    case "all":
                    default:
                        // No additional filter
                        break;
                }
            }

            query = query.OrderByDescending(b => b.BorrowDate);

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

            var borrows = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.Id,
                    b.BorrowDate,
                    b.DueDate,
                    b.ReturnDate,
                    b.Status,
                    b.Notes,
                    // Calculate dynamic status for overdue
                    ActualStatus = b.Status == "borrowed" && b.DueDate < currentDate ? "overdue" : b.Status,
                    // Calculate days overdue if applicable
                    DaysOverdue = b.Status == "borrowed" && b.DueDate < currentDate ? (currentDate - b.DueDate).Days : (int?)null,
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        Category = new { b.Book.Category.Name }
                    },
                    // Include fees information
                    Fees = b.Fees.Select(f => new
                    {
                        f.Id,
                        f.Amount,
                        f.Type,
                        f.Status,
                        f.PaymentMethod,
                        f.CreatedAt,
                        f.PaidAt
                    }).ToList(),
                    // Calculate total fees for this borrow
                    TotalFees = b.Fees.Sum(f => f.Amount),
                    UnpaidFees = b.Fees.Where(f => f.Status == "unpaid").Sum(f => f.Amount)
                })
                .ToListAsync();
            return Ok(new
            {
                data = borrows,
                pageNumber,
                pageSize,
                totalRecords,
                totalPages
            });
        }

        // ==========================================
        // GET: api/Borrow/overdue
        // ==========================================
        [HttpGet("overdue")]
        public async Task<ActionResult<object>> GetOverdueBorrows([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100; // Giới hạn tối đa để tránh timeout

            var currentDate = DateTime.Now;
            var query = _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                .Where(b => b.Status == "borrowed" && b.DueDate < currentDate)
                .OrderBy(b => b.DueDate);

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

            var overdueBorrows = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.Id,
                    b.BorrowDate,
                    b.DueDate,
                    DaysOverdue = (currentDate - b.DueDate).Days,
                    User = new { b.User.Id, b.User.Username, b.User.Fullname, b.User.Email, b.User.Phone },
                    Book = new { b.Book.Id, b.Book.Title, b.Book.Author }
                })
                .ToListAsync();

            return Ok(new
            {
                data = overdueBorrows,
                pageNumber,
                pageSize,
                totalRecords,
                totalPages
            });
        }

        // ==========================================
        // GET: api/Borrow/user/{userId}/statistics
        // ==========================================
        [HttpGet("user/{userId}/statistics")]
        public async Task<ActionResult<object>> GetUserBorrowStatistics(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
                return NotFound(new { message = "User không tồn tại." });

            var currentDate = DateTime.Now;

            // Tổng số lượt mượn
            var totalBorrows = await _context.Borrows
                .Where(b => b.UserId == userId)
                .CountAsync();

            // Số lượt đang mượn (borrowed)
            var currentBorrows = await _context.Borrows
                .Where(b => b.UserId == userId && b.Status == "borrowed")
                .CountAsync();

            // Số lượt trả đúng hạn (returned và ReturnDate <= DueDate)
            var onTimeReturns = await _context.Borrows
                .Where(b => b.UserId == userId &&
                           b.Status == "returned" &&
                           b.ReturnDate.HasValue &&
                           b.ReturnDate <= b.DueDate)
                .CountAsync();

            // Số lượt trả trễ (returned và ReturnDate > DueDate)
            var lateReturns = await _context.Borrows
                .Where(b => b.UserId == userId &&
                           b.Status == "returned" &&
                           b.ReturnDate.HasValue &&
                           b.ReturnDate > b.DueDate)
                .CountAsync();

            // Số lượt quá hạn hiện tại (borrowed và DueDate < currentDate)
            var overdueCount = await _context.Borrows
                .Where(b => b.UserId == userId &&
                           b.Status == "borrowed" &&
                           b.DueDate < currentDate)
                .CountAsync();

            // Tổng số phí
            var totalFees = await _context.Fees
                .Where(f => f.UserId == userId)
                .SumAsync(f => (decimal?)f.Amount) ?? 0;

            // Phí chưa thanh toán
            var unpaidFees = await _context.Fees
                .Where(f => f.UserId == userId && f.Status == "unpaid")
                .SumAsync(f => (decimal?)f.Amount) ?? 0;

            return Ok(new
            {
                totalBorrows,
                currentBorrows,
                onTimeReturns,
                lateReturns,
                overdueCount,
                totalFees,
                unpaidFees
            });
        }

        // ==========================================
        // POST: api/Borrow/request
        // ========================================== 
        // API cho USER tạo yêu cầu mượn (status = "request")
        [HttpPost("request")]
        public async Task<ActionResult<object>> CreateBorrowRequest([FromBody] CreateBorrowRequest dto)
        {
            if (dto == null) return BadRequest("Request body is null");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists) return BadRequest(new { message = "User không tồn tại." });

            var book = await _context.Books.FindAsync(dto.BookId);
            if (book == null) return BadRequest(new { message = "Sách không tồn tại." });
            if (book.AvailableCopies <= 0) return BadRequest(new { message = "Sách đã hết, không thể mượn." });

            bool existingBorrow = await _context.Borrows
                .AnyAsync(b => b.UserId == dto.UserId && b.BookId == dto.BookId && (b.Status == "borrowed" || b.Status == "request"));
            if (existingBorrow) return BadRequest(new { message = "User đã có yêu cầu mượn hoặc đang mượn sách này." });

            var borrow = new Borrow
            {
                UserId = dto.UserId,
                BookId = dto.BookId,
                BorrowDate = dto.BorrowDate ?? DateTime.Now,
                DueDate = dto.DueDate == null || dto.DueDate == default
                    ? DateTime.Now.AddDays(14)
                    : DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Local),
                Status = "request", // Đặt status là request thay vì borrowed
                Notes = dto.Notes,
                Createdat = DateTime.Now,
                Updatedat = DateTime.Now
            };

            // Trừ AvailableCopies ngay khi tạo request (reserve sách)
            book.AvailableCopies = (book.AvailableCopies ?? 0) - 1;
            _context.Borrows.Add(borrow);
            await _context.SaveChangesAsync();

            // Tạo Fee record cho borrow fee
            if (dto.Fee.HasValue && dto.Fee.Value > 0)
            {
                var borrowFee = new Fee
                {
                    BorrowId = borrow.Id,
                    UserId = dto.UserId,
                    Amount = dto.Fee.Value,
                    Type = "borrow_fee",
                    Status = "unpaid",
                    Notes = "Phí mượn sách",
                    CreatedAt = DateTime.Now
                };

                _context.Fees.Add(borrowFee);
                await _context.SaveChangesAsync();
            }

            await _context.Entry(borrow).Reference(b => b.User).LoadAsync();
            await _context.Entry(borrow).Reference(b => b.Book).LoadAsync();

            return CreatedAtAction(nameof(GetBorrow), new { id = borrow.Id }, new
            {
                borrow.Id,
                borrow.UserId,
                borrow.BookId,
                borrow.BorrowDate,
                borrow.DueDate,
                borrow.Status,
                borrow.Createdat
            });
        }

        // POST: api/Borrow/staff-checkin
        // ========================================== 
        // API cho STAFF tạo phiếu mượn trực tiếp (status = "borrowed")
        [HttpPost("staff-checkin")]
        [Authorize(Roles = "Staff,Admin,staff,admin")] // Support both cases
        public async Task<ActionResult<object>> StaffCreateBorrow([FromBody] CreateBorrowRequest dto)
        {
            if (dto == null) return BadRequest("Request body is null");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists) return BadRequest(new { message = "User không tồn tại." });

            var book = await _context.Books.FindAsync(dto.BookId);
            if (book == null) return BadRequest(new { message = "Sách không tồn tại." });
            if (book.AvailableCopies <= 0) return BadRequest(new { message = "Sách đã hết, không thể mượn." });

            bool existingBorrow = await _context.Borrows
                .AnyAsync(b => b.UserId == dto.UserId && b.BookId == dto.BookId && (b.Status == "borrowed" || b.Status == "request"));
            if (existingBorrow) return BadRequest(new { message = "User đã có yêu cầu mượn hoặc đang mượn sách này." });

            var borrow = new Borrow
            {
                UserId = dto.UserId,
                BookId = dto.BookId,
                BorrowDate = dto.BorrowDate ?? DateTime.Now,
                DueDate = dto.DueDate == null || dto.DueDate == default
                    ? DateTime.Now.AddDays(14)
                    : DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Local),
                Status = "borrowed", // 🔥 STAFF tạo trực tiếp với status "borrowed"
                Notes = dto.Notes,
                Createdat = DateTime.Now,
                Updatedat = DateTime.Now
            };

            // Trừ AvailableCopies ngay khi tạo borrow
            book.AvailableCopies = (book.AvailableCopies ?? 0) - 1;
            _context.Borrows.Add(borrow);
            await _context.SaveChangesAsync();

            // Tạo Fee record cho borrow fee (nếu có)
            if (dto.Fee.HasValue && dto.Fee.Value > 0)
            {
                var borrowFee = new Fee
                {
                    BorrowId = borrow.Id,
                    UserId = dto.UserId,
                    Amount = dto.Fee.Value,
                    Type = "borrow_fee",
                    Status = "unpaid",
                    Notes = "Phí mượn sách - Tạo bởi staff",
                    CreatedAt = DateTime.Now
                };

                _context.Fees.Add(borrowFee);
                await _context.SaveChangesAsync();
            }

            await _context.Entry(borrow).Reference(b => b.User).LoadAsync();
            await _context.Entry(borrow).Reference(b => b.Book).LoadAsync();

            return CreatedAtAction(nameof(GetBorrow), new { id = borrow.Id }, new
            {
                borrow.Id,
                borrow.UserId,
                borrow.BookId,
                borrow.BorrowDate,
                borrow.DueDate,
                borrow.Status,
                borrow.Createdat,
                Message = "✅ Staff đã tạo phiếu mượn thành công với trạng thái 'borrowed'"
            });
        }

        // ==========================================
        // PATCH: api/Borrow/{id}/return
        // ==========================================
        [HttpPatch("{id}/return")]
        public async Task<IActionResult> ReturnBook(int id, [FromBody] ReturnRequest? request = null)
        {
            var borrow = await _context.Borrows
                .Include(b => b.Book)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (borrow == null)
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });

            if (borrow.Status != "borrowed")
                return BadRequest(new { message = "Sách đã được trả hoặc trạng thái không hợp lệ." });

            borrow.ReturnDate = DateTime.Now;
            borrow.Status = "returned";
            borrow.Notes = request?.Notes ?? borrow.Notes;
            borrow.Updatedat = DateTime.Now;

            borrow.Book.AvailableCopies = (borrow.Book.AvailableCopies ?? 0) + 1;

            // 🔥 Tự động tạo phí trễ hạn nếu cần
            if (borrow.ReturnDate > borrow.DueDate)
            {
                // Kiểm tra đã có phí trễ cho borrow này chưa
                var existingFee = await _context.Fees
                    .FirstOrDefaultAsync(f => f.BorrowId == borrow.Id && f.Type == "late_fee");

                if (existingFee == null)
                {
                    int daysLate = ((borrow.ReturnDate ?? DateTime.Now) - borrow.DueDate).Days;
                    decimal fineAmount = daysLate * 5000m; // 5,000đ/ngày trễ

                    var fee = new Fee
                    {
                        UserId = borrow.UserId,
                        BorrowId = borrow.Id,
                        Amount = fineAmount,
                        Type = "late_fee",
                        Status = "unpaid",
                        Notes = $"Trả trễ {daysLate} ngày cho sách '{borrow.Book.Title}'",
                        CreatedAt = DateTime.Now
                    };

                    _context.Fees.Add(fee);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Trả sách thành công.",
                borrow = new
                {
                    borrow.Id,
                    borrow.ReturnDate,
                    borrow.Status,
                    Book = new
                    {
                        borrow.Book.Title,
                        borrow.Book.AvailableCopies
                    }
                }
            });
        }

        // ==========================================
        // PATCH: api/Borrow/{id}
        // ==========================================
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateBorrow(int id, [FromBody] UpdateBorrowRequest dto)
        {
            if (dto == null) return BadRequest("Request body is null");
            if (id != dto.Id) return BadRequest("ID không khớp.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existingBorrow = await _context.Borrows.FindAsync(id);
            if (existingBorrow == null) return NotFound(new { message = "Không tìm thấy phiếu mượn này." });

            existingBorrow.DueDate = dto.DueDate ?? existingBorrow.DueDate;
            existingBorrow.Notes = dto.Notes ?? existingBorrow.Notes;
            existingBorrow.Updatedat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật phiếu mượn thành công.", borrow = existingBorrow });
        }

        // ==========================================
        // PATCH: api/Borrow/{id}/approve - Duyệt yêu cầu mượn sách
        // ==========================================
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> ApproveBorrowRequest(int id, [FromBody] ApproveRequest? request = null)
        {
            var borrow = await _context.Borrows
                .Include(b => b.Book)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (borrow == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu mượn sách này." });

            if (borrow.Status != "request")
                return BadRequest(new { message = "Yêu cầu này đã được xử lý hoặc trạng thái không hợp lệ." });

            if (borrow.Book.AvailableCopies <= 0)
                return BadRequest(new { message = "Sách đã hết, không thể duyệt yêu cầu này." });

            // Approve request (sách đã được trừ khi tạo request)
            borrow.Status = "borrowed";
            borrow.BorrowDate = DateTime.Now; // Update actual borrow date
            borrow.Notes = request?.Notes ?? borrow.Notes;
            borrow.Updatedat = DateTime.Now;

            // Không cần trừ AvailableCopies vì đã trừ khi tạo request

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Duyệt yêu cầu mượn sách thành công.",
                borrowId = borrow.Id,
                status = borrow.Status,
                borrowDate = borrow.BorrowDate,
                dueDate = borrow.DueDate
            });
        }

        // ==========================================
        // PATCH: api/Borrow/{id}/reject - Từ chối yêu cầu mượn sách
        // ==========================================
        [HttpPatch("{id}/reject")]
        public async Task<IActionResult> RejectBorrowRequest(int id, [FromBody] RejectRequest? request = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var borrow = await _context.Borrows
                    .Include(b => b.User)
                    .Include(b => b.Book)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (borrow == null)
                    return NotFound(new { message = "Không tìm thấy yêu cầu mượn sách này." });

                if (borrow.Status != "request")
                    return BadRequest(new { message = "Yêu cầu này đã được xử lý hoặc trạng thái không hợp lệ." });

                // Lấy thông tin hiện tại
                var currentAvailable = borrow.Book.AvailableCopies ?? 0;
                var totalCopies = borrow.Book.TotalCopies ?? 0;

                Console.WriteLine($"📊 REJECT - Book ID: {borrow.Book.Id}, Available: {currentAvailable}, Total: {totalCopies}");

                // Cập nhật borrow status
                borrow.Status = "rejected";
                borrow.Notes = request?.Notes ?? borrow.Notes;
                borrow.Updatedat = DateTime.Now;

                // SAFE LOGIC: Chỉ cộng nếu không vi phạm constraint
                if (currentAvailable < totalCopies)
                {
                    borrow.Book.AvailableCopies = currentAvailable + 1;
                    Console.WriteLine($"✅ RESTORED: {currentAvailable} → {borrow.Book.AvailableCopies}");
                }
                else
                {
                    Console.WriteLine($"⚠️ SKIP RESTORE: Available({currentAvailable}) >= Total({totalCopies})");
                }

                // 🆕 Xóa phí mặc định mượn sách (20,000 VND)
                var defaultFees = await _context.Fees
                    .Where(f => f.BorrowId == id && 
                               f.Type == "borrow_fee" && 
                               f.Status != "paid")
                    .ToListAsync();

                Console.WriteLine($"🔍 SEARCHING FEES: BorrowId={id}, Found={defaultFees.Count} fees");

                int deletedFeesCount = 0;
                decimal deletedFeesAmount = 0;

                if (defaultFees.Any())
                {
                    deletedFeesCount = defaultFees.Count;
                    deletedFeesAmount = defaultFees.Sum(f => f.Amount);
                    
                    _context.Fees.RemoveRange(defaultFees);
                    Console.WriteLine($"🗑️ DELETED FEES: {deletedFeesCount} fees, total: {deletedFeesAmount:C}");
                }
                else
                {
                    // Debug: Show all fees for this borrow
                    var allFeesForBorrow = await _context.Fees
                        .Where(f => f.BorrowId == id)
                        .Select(f => new { f.Id, f.Type, f.Status, f.Amount })
                        .ToListAsync();
                    Console.WriteLine($"🔍 ALL FEES FOR BORROW {id}: {string.Join(", ", allFeesForBorrow.Select(f => $"[{f.Id}:{f.Type}:{f.Status}:{f.Amount}]"))}");
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Từ chối yêu cầu mượn sách thành công.",
                    borrowId = borrow.Id,
                    status = borrow.Status,
                    rejectionReason = request?.Notes,
                    bookInfo = new
                    {
                        bookId = borrow.Book.Id,
                        title = borrow.Book.Title,
                        availableCopies = borrow.Book.AvailableCopies,
                        totalCopies = borrow.Book.TotalCopies,
                        wasRestored = currentAvailable < totalCopies
                    },
                    feesInfo = new
                    {
                        deletedCount = deletedFeesCount,
                        deletedAmount = deletedFeesAmount,
                        message = deletedFeesCount > 0 
                            ? $"Đã xóa {deletedFeesCount} phí mượn sách ({deletedFeesAmount:C})"
                            : "Không có phí nào cần xóa"
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"❌ REJECT ERROR: {ex.Message}");
                return StatusCode(500, new
                {
                    message = "Lỗi khi từ chối yêu cầu mượn sách",
                    error = ex.Message
                });
            }
        }

        // ==========================================
        // DELETE: api/Borrow/{id}
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBorrow(int id)
        {
            var borrow = await _context.Borrows.Include(b => b.Book).FirstOrDefaultAsync(b => b.Id == id);
            if (borrow == null)
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });

            if (borrow.Status == "borrowed" || borrow.Status == "request")
                borrow.Book.AvailableCopies = (borrow.Book.AvailableCopies ?? 0) + 1;

            _context.Borrows.Remove(borrow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa phiếu mượn thành công." });
        }

        private bool BorrowExists(int id) => _context.Borrows.Any(e => e.Id == id);

        // ==========================================
        // GET: api/Borrow/test - Simple test endpoint
        // ==========================================
        [HttpGet("test")]
        public async Task<ActionResult<object>> TestBorrows([FromQuery] string? status = null)
        {
            try
            {
                var query = _context.Borrows.AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(b => b.Status == status);
                }

                var totalRecords = await query.CountAsync();
                var borrows = await query
                    .Take(5) // Chỉ lấy 5 records đơn giản
                    .Select(b => new
                    {
                        b.Id,
                        b.Status,
                        b.BorrowDate,
                        b.UserId,
                        b.BookId
                    })
                    .ToListAsync();

                return Ok(new
                {
                    data = borrows,
                    totalRecords,
                    message = "Simple test query success"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // ==========================================
        // POST: api/Borrow/trigger-sync - Trigger manual sync (Admin only)
        // ==========================================
        [HttpPost("trigger-sync")]
        public async Task<IActionResult> TriggerManualSync()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var syncService = scope.ServiceProvider.GetService<Services.BookQuantitySyncService>();

                if (syncService != null)
                {
                    await syncService.TriggerManualSync();
                    return Ok(new
                    {
                        message = "Manual sync triggered successfully.",
                        timestamp = DateTime.Now
                    });
                }
                else
                {
                    // Fallback: chạy sync trực tiếp
                    return await AutoSyncBookQuantities();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi trigger manual sync",
                    error = ex.Message
                });
            }
        }

        // ==========================================
        // GET: api/Borrow/validate-book-quantities - Kiểm tra độ chính xác số lượng sách
        // ==========================================
        [HttpGet("validate-book-quantities")]
        public async Task<IActionResult> ValidateBookQuantities()
        {
            try
            {
                var validationResults = new List<object>();
                var inconsistentCount = 0;

                var books = await _context.Books.ToListAsync();

                foreach (var book in books)
                {
                    var borrowedOrRequestedCount = await _context.Borrows
                        .CountAsync(b => b.BookId == book.Id &&
                                       (b.Status == "borrowed" || b.Status == "request"));

                    var expectedAvailable = Math.Max(0, (book.TotalCopies ?? 0) - borrowedOrRequestedCount);
                    var currentAvailable = book.AvailableCopies ?? 0;

                    var isConsistent = expectedAvailable == currentAvailable;

                    if (!isConsistent)
                    {
                        inconsistentCount++;
                    }

                    validationResults.Add(new
                    {
                        bookId = book.Id,
                        title = book.Title,
                        totalCopies = book.TotalCopies,
                        currentAvailable,
                        expectedAvailable,
                        borrowedOrRequested = borrowedOrRequestedCount,
                        isConsistent,
                        difference = expectedAvailable - currentAvailable,
                        status = isConsistent ? "OK" : "INCONSISTENT"
                    });
                }

                return Ok(new
                {
                    message = inconsistentCount == 0 ?
                        "Tất cả sách có số lượng chính xác." :
                        $"Phát hiện {inconsistentCount} sách có số lượng không chính xác.",
                    totalBooks = books.Count,
                    inconsistentBooks = inconsistentCount,
                    allConsistent = inconsistentCount == 0,
                    books = validationResults.OrderBy(b => ((dynamic)b).isConsistent).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi kiểm tra số lượng sách",
                    error = ex.Message
                });
            }
        }

        // ==========================================
        // POST: api/Borrow/auto-sync-book-quantities - Tự động đồng bộ số lượng sách
        // ==========================================
        [HttpPost("auto-sync-book-quantities")]
        public async Task<IActionResult> AutoSyncBookQuantities()
        {
            try
            {
                var syncResults = new List<object>();
                var totalSynced = 0;

                // Lấy tất cả sách và tính toán lại số lượng available
                var books = await _context.Books.ToListAsync();

                foreach (var book in books)
                {
                    // Tính số sách đang được mượn hoặc đang chờ duyệt
                    var borrowedOrRequestedCount = await _context.Borrows
                        .CountAsync(b => b.BookId == book.Id &&
                                       (b.Status == "borrowed" || b.Status == "request"));

                    // Tính số sách có sẵn thực tế = Tổng số - Đang mượn/chờ duyệt
                    var actualAvailable = Math.Max(0, (book.TotalCopies ?? 0) - borrowedOrRequestedCount);
                    var currentAvailable = book.AvailableCopies ?? 0;

                    // Chỉ update nếu khác với giá trị hiện tại
                    if (actualAvailable != currentAvailable)
                    {
                        Console.WriteLine($"🔄 SYNC Book ID {book.Id}: {currentAvailable} → {actualAvailable} (Total: {book.TotalCopies}, Borrowed: {borrowedOrRequestedCount})");

                        book.AvailableCopies = actualAvailable;
                        book.Updatedat = DateTime.Now;
                        totalSynced++;

                        syncResults.Add(new
                        {
                            bookId = book.Id,
                            title = book.Title,
                            totalCopies = book.TotalCopies,
                            borrowedOrRequested = borrowedOrRequestedCount,
                            oldAvailable = currentAvailable,
                            newAvailable = actualAvailable,
                            difference = actualAvailable - currentAvailable
                        });
                    }
                }

                if (totalSynced > 0)
                {
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    message = totalSynced > 0 ?
                        $"Đã đồng bộ {totalSynced} sách." :
                        "Tất cả sách đã đồng bộ chính xác.",
                    totalBooksChecked = books.Count,
                    totalSynced,
                    syncResults
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ SYNC ERROR: {ex.Message}");
                return StatusCode(500, new
                {
                    message = "Lỗi khi đồng bộ số lượng sách",
                    error = ex.Message
                });
            }
        }

        // ==========================================
        // POST: api/Borrow/heal-data - Sửa dữ liệu corrupt (Admin only)
        // ==========================================
        [HttpPost("heal-data")]
        public async Task<IActionResult> HealCorruptedData()
        {
            try
            {
                var corruptedBooks = await _context.Books
                    .Where(b => b.AvailableCopies > b.TotalCopies)
                    .ToListAsync();

                var healedCount = 0;
                foreach (var book in corruptedBooks)
                {
                    Console.WriteLine($"🔧 HEALING Book ID {book.Id}: Available({book.AvailableCopies}) > Total({book.TotalCopies})");

                    book.AvailableCopies = book.TotalCopies; // Reset về max allowed
                    healedCount++;
                }

                if (healedCount > 0)
                {
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    message = healedCount > 0 ?
                        $"Đã sửa {healedCount} sách có dữ liệu bị lỗi." :
                        "Không tìm thấy dữ liệu bị lỗi.",
                    healedBooks = corruptedBooks.Select(b => new
                    {
                        bookId = b.Id,
                        title = b.Title,
                        originalAvailable = b.AvailableCopies,
                        totalCopies = b.TotalCopies,
                        fixedAvailable = b.TotalCopies
                    })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi sửa dữ liệu",
                    error = ex.Message
                });
            }
        }
    }

    // Helper class cho yêu cầu trả sách
    public class ReturnRequest
    {
        public string? Notes { get; set; }
    }

    // Helper class cho yêu cầu duyệt mượn sách
    public class ApproveRequest
    {
        public string? Notes { get; set; }
    }

    // Helper class cho yêu cầu từ chối mượn sách  
    public class RejectRequest
    {
        public string? Notes { get; set; }
    }
}
