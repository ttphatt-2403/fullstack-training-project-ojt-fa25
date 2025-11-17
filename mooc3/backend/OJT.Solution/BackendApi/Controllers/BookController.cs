using BackendApi.Dtos; // Thêm dòng này để dùng DTO
using BackendApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly OjtDbContext _context;

        public BookController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Book?pageNumber=1&pageSize=10
        [HttpGet]
        public async Task<ActionResult<object>> GetBooks([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = _context.Books
                .Include(b => b.Category)
                .Include(b => b.Borrows)
                .OrderBy(b => b.Title);

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

            var books = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Isbn,
                    b.Publisher,
                    b.PublishedDate,
                    b.Description,
                    b.TotalCopies,
                    b.AvailableCopies,
                    b.ImageUrl,
                    b.CategoryId,
                    Category = new
                    {
                        b.Category.Id,
                        b.Category.Name
                    },
                    b.Createdat,
                    b.Updatedat
                })
                .ToListAsync();

            return Ok(new
            {
                data = books,
                pageNumber,
                pageSize,
                totalRecords,
                totalPages
            });
        }

        // GET: api/Book/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Borrows)
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Isbn,
                    b.Publisher,
                    b.PublishedDate,
                    b.Description,
                    b.TotalCopies,
                    b.AvailableCopies,
                    b.ImageUrl,
                    b.CategoryId,
                    Category = new
                    {
                        b.Category.Id,
                        b.Category.Name,
                        b.Category.Description
                    },
                    BorrowCount = b.Borrows.Count(br => br.Status == "borrowed"),
                    b.Createdat,
                    b.Updatedat
                })
                .FirstOrDefaultAsync();

            if (book == null)
            {
                return NotFound(new { message = "Không tìm thấy sách này." });
            }

            return Ok(book);
        }

        // GET: api/Book/search?query=...
        [HttpGet("search")]
        public async Task<ActionResult<object>> SearchBooks(
            [FromQuery] string query = "",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var booksQuery = _context.Books
                .Include(b => b.Category)
                .AsQueryable();

            // Normalize query once
            var q = (query ?? "").Trim();
            if (!string.IsNullOrEmpty(q))
            {
                // Use EF.Functions.Like where possible — relying on DB collation for case-insensitivity.
                var pattern = $"%{q}%";
                booksQuery = booksQuery.Where(b =>
                    // Null safe checks using coalesce
                    EF.Functions.Like(b.Title ?? "", pattern) ||
                    EF.Functions.Like(b.Author ?? "", pattern) ||
                    EF.Functions.Like(b.Isbn ?? "", pattern) ||
                    EF.Functions.Like(b.Category != null ? b.Category.Name : "", pattern)
                );
            }

            var totalRecords = await booksQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

            // Optional: clamp pageNumber to totalPages (if you prefer)
            if (pageNumber > totalPages && totalPages > 0) pageNumber = totalPages;

            var items = await booksQuery
                .OrderBy(b => b.Title)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Isbn,
                    b.Publisher,
                    b.PublishedDate,    // thêm nếu frontend cần prefill
                    b.TotalCopies,
                    b.AvailableCopies,
                    b.ImageUrl,
                    Category = b.Category == null ? null : new
                    {
                        b.Category.Id,
                        b.Category.Name
                    }
                })
                .ToListAsync();

            return Ok(new
            {
                data = items,
                pageNumber,
                pageSize,
                totalRecords,
                totalPages
            });
        }

        // GET: api/Book/5/borrows - Xem các phiếu mượn của sách
        [HttpGet("{id}/borrows")]
        public async Task<ActionResult<object>> GetBookBorrows(
            int id,
            [FromQuery] string status = "",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            // Kiểm tra sách có tồn tại không
            var bookExists = await _context.Books.AnyAsync(b => b.Id == id);
            if (!bookExists)
                return NotFound(new { message = "Không tìm thấy sách này." });

            var query = _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                .Where(b => b.BookId == id);

            // Lọc theo status nếu có
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b => b.Status.ToLower() == status.ToLower());
            }

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

            var borrows = await query
                .OrderByDescending(b => b.BorrowDate)
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
                    DaysOverdue = b.Status == "borrowed" && b.DueDate < DateTime.Now
                        ? (DateTime.Now - b.DueDate).Days
                        : (int?)null,
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
                        b.Book.Author
                    },
                    b.Createdat,
                    b.Updatedat
                })
                .ToListAsync();

            // Lấy thông tin tổng quan về sách
            var bookInfo = await _context.Books
                .Include(b => b.Category)
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.TotalCopies,
                    b.AvailableCopies,
                    Category = new { b.Category.Id, b.Category.Name },
                    CurrentlyBorrowed = b.Borrows.Count(br => br.Status == "borrowed"),
                    TotalBorrows = b.Borrows.Count()
                })
                .FirstOrDefaultAsync();

            return Ok(new
            {
                book = bookInfo,
                borrows = new
                {
                    data = borrows,
                    pageNumber,
                    pageSize,
                    totalRecords,
                    totalPages
                },
                summary = new
                {
                    totalBorrows = totalRecords,
                    currentlyBorrowed = borrows.Count(b => b.Status == "borrowed"),
                    returned = borrows.Count(b => b.Status == "returned"),
                    overdue = borrows.Count(b => b.Status == "borrowed" && b.DaysOverdue > 0)
                }
            });
        }

        // GET: api/Book/category/5
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBooksByCategory(int categoryId)
        {
            var books = await _context.Books
                .Include(b => b.Category)
                .Where(b => b.CategoryId == categoryId)
                .OrderBy(b => b.Title)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.AvailableCopies,
                    Category = new
                    {
                        b.Category.Id,
                        b.Category.Name
                    }
                })
                .ToListAsync();

            return Ok(books);
        }

        // POST: api/Book
        [HttpPost]
        public async Task<ActionResult<object>> CreateBook([FromBody] CreateBookDto dto)
        {
            if (dto == null)
                return BadRequest("Request body is null");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra CategoryId có tồn tại không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
                return BadRequest(new { message = "Thể loại không tồn tại." });

            // Kiểm tra ISBN đã tồn tại chưa (nếu có)
            if (!string.IsNullOrEmpty(dto.Isbn))
            {
                var existingBook = await _context.Books
                    .FirstOrDefaultAsync(b => b.Isbn == dto.Isbn);
                if (existingBook != null)
                    return BadRequest(new { message = "ISBN đã tồn tại." });
            }

            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Isbn = dto.Isbn,
                Publisher = dto.Publisher,
                // Đúng kiểu: DateOnly
                PublishedDate = DateOnly.FromDateTime(dto.PublishedDate),
                Description = dto.Description,
                TotalCopies = dto.TotalCopies > 0 ? dto.TotalCopies : 1,
                AvailableCopies = dto.AvailableCopies > 0 ? dto.AvailableCopies : dto.TotalCopies,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                Createdat = DateTime.Now,
                Updatedat = DateTime.Now
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            // Load Category, nếu muốn trả ra category
            await _context.Entry(book).Reference(b => b.Category).LoadAsync();

            // Trả về object phẳng để tránh lỗi vòng lặp serialize
            var bookResponse = new
            {
                book.Id,
                book.Title,
                book.Author,
                book.Isbn,
                book.Publisher,
                book.PublishedDate,
                book.Description,
                book.TotalCopies,
                book.AvailableCopies,
                book.ImageUrl,
                book.CategoryId,
                Category = new
                {
                    book.Category?.Id,
                    book.Category?.Name
                },
                book.Createdat,
                book.Updatedat
            };
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, bookResponse);
        }
        // PUT: api/Book/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Request body is null." });

            var existingBook = await _context.Books
                .Include(b => b.Borrows)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (existingBook == null)
                return NotFound(new { message = "Sách không tồn tại." });

            // --- CATEGORY ---
            if (dto.CategoryId.HasValue && dto.CategoryId.Value > 0)
            {
                var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId.Value);
                if (!categoryExists)
                    return BadRequest(new { message = "Thể loại không tồn tại." });
                existingBook.CategoryId = dto.CategoryId.Value;
            }

            // --- BASIC FIELDS ---
            if (dto.Title != null) existingBook.Title = dto.Title.Trim();
            if (dto.Author != null) existingBook.Author = dto.Author.Trim();
            if (dto.Isbn != null) existingBook.Isbn = dto.Isbn.Trim();
            if (dto.Publisher != null) existingBook.Publisher = dto.Publisher.Trim();
            if (dto.Description != null) existingBook.Description = dto.Description.Trim();
            if (dto.ImageUrl != null) existingBook.ImageUrl = dto.ImageUrl.Trim();

            // --- DATE ---
            if (dto.PublishedDate.HasValue)
                existingBook.PublishedDate = DateOnly.FromDateTime(dto.PublishedDate.Value);

            // --- TOTAL / AVAILABLE COPIES ---
            if (dto.TotalCopies.HasValue)
            {
                var borrowedCount = (existingBook.TotalCopies ?? 0) - (existingBook.AvailableCopies ?? 0);
                if (dto.TotalCopies.Value < borrowedCount)
                    return BadRequest(new { message = $"Không thể giảm TotalCopies xuống dưới số đang mượn ({borrowedCount})" });

                existingBook.TotalCopies = dto.TotalCopies.Value;
            }

            if (dto.AvailableCopies.HasValue)
            {
                // chỉ cập nhật khi client gửi AvailableCopies
                var total = existingBook.TotalCopies ?? 0;
                var reqAvailable = Math.Clamp(dto.AvailableCopies.Value, 0, total);
                existingBook.AvailableCopies = reqAvailable;
            }

            // --- AUDIT ---
            existingBook.Updatedat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công." });
        }


        // PATCH: api/Book/5/quantity - Cập nhật số lượng sách (chỉ staff)
        [HttpPatch("{id}/quantity")]
        [Authorize(Roles = "staff,admin")]
        public async Task<IActionResult> UpdateBookQuantity(int id, [FromBody] UpdateBookQuantityRequest dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Request body is null." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var book = await _context.Books
                .Include(b => b.Borrows.Where(br => br.Status == "borrowed"))
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
                return NotFound(new { message = "Không tìm thấy sách này." });

            var currentBorrowedCount = book.Borrows.Count;
            var currentTotal = book.TotalCopies ?? 0;
            var currentAvailable = book.AvailableCopies ?? 0;

            // Validation cho TotalCopies
            if (dto.TotalCopies.HasValue)
            {
                if (dto.TotalCopies.Value < currentBorrowedCount)
                {
                    return BadRequest(new
                    {
                        message = $"Không thể giảm tổng số sách xuống {dto.TotalCopies.Value}. Hiện có {currentBorrowedCount} sách đang được mượn.",
                        currentBorrowedCount,
                        requestedTotal = dto.TotalCopies.Value
                    });
                }

                book.TotalCopies = dto.TotalCopies.Value;

                // Tự động điều chỉnh AvailableCopies nếu cần
                var newAvailable = dto.TotalCopies.Value - currentBorrowedCount;
                book.AvailableCopies = newAvailable;
            }

            // Validation cho AvailableCopies (nếu chỉ cập nhật available)
            if (dto.AvailableCopies.HasValue && !dto.TotalCopies.HasValue)
            {
                var maxAvailable = currentTotal - currentBorrowedCount;
                if (dto.AvailableCopies.Value > maxAvailable)
                {
                    return BadRequest(new
                    {
                        message = $"Số sách có sẵn không thể vượt quá {maxAvailable} (Tổng: {currentTotal}, Đang mượn: {currentBorrowedCount})",
                        maxAvailable,
                        currentBorrowedCount,
                        totalCopies = currentTotal
                    });
                }

                if (dto.AvailableCopies.Value < 0)
                {
                    return BadRequest(new { message = "Số sách có sẵn không thể âm." });
                }

                book.AvailableCopies = dto.AvailableCopies.Value;
            }

            book.Updatedat = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật số lượng sách thành công.",
                book = new
                {
                    book.Id,
                    book.Title,
                    book.TotalCopies,
                    book.AvailableCopies,
                    BorrowedCount = currentBorrowedCount,
                    book.Updatedat
                }
            });
        }

        // DELETE: api/Book/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Borrows)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound(new { message = "Không tìm thấy sách này." });
            }

            // Kiểm tra xem sách có đang được mượn không
            var activeBorrows = book.Borrows.Any(b => b.Status == "borrowed");
            if (activeBorrows)
            {
                return BadRequest(new { message = "Không thể xóa sách này vì đang có người mượn." });
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa sách thành công." });
        }



        private bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
    }
}
