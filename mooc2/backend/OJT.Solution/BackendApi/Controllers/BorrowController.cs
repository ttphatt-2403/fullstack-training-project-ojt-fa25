using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BorrowController : ControllerBase
    {
        private readonly OjtDbContext _context;

        public BorrowController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Borrow
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBorrows()
        {
            var borrows = await _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                .ThenInclude(book => book.Category)
                .OrderByDescending(b => b.BorrowDate)
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
                        b.User.Email
                    },
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        Category = new
                        {
                            b.Book.Category.Id,
                            b.Book.Category.Name
                        }
                    },
                    b.Createdat
                })
                .ToListAsync();

            return Ok(borrows);
        }

        // GET: api/Borrow/5
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
            {
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
            }

            return Ok(borrow);
        }

        // GET: api/Borrow/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBorrowsByUser(int userId)
        {
            var borrows = await _context.Borrows
                .Include(b => b.Book)
                .ThenInclude(book => book.Category)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BorrowDate)
                .Select(b => new
                {
                    b.Id,
                    b.BorrowDate,
                    b.DueDate,
                    b.ReturnDate,
                    b.Status,
                    b.Notes,
                    Book = new
                    {
                        b.Book.Id,
                        b.Book.Title,
                        b.Book.Author,
                        Category = new
                        {
                            b.Book.Category.Name
                        }
                    }
                })
                .ToListAsync();

            return Ok(borrows);
        }

        // GET: api/Borrow/overdue
        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<object>>> GetOverdueBorrows()
        {
            var currentDate = DateTime.Now;

            var overdueBorrows = await _context.Borrows
                .Include(b => b.User)
                .Include(b => b.Book)
                .Where(b => b.Status == "borrowed" && b.DueDate < currentDate)
                .OrderBy(b => b.DueDate)
                .Select(b => new
                {
                    b.Id,
                    b.BorrowDate,
                    b.DueDate,
                    DaysOverdue = (currentDate - b.DueDate).Days,
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
                    }
                })
                .ToListAsync();

            return Ok(overdueBorrows);
        }

        // POST: api/Borrow
        [HttpPost]
        public async Task<ActionResult<Borrow>> CreateBorrow([FromBody] Borrow borrow)
        {
            if (borrow == null)
                return BadRequest("Request body is null");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra User có tồn tại không
            var userExists = await _context.Users.AnyAsync(u => u.Id == borrow.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = "User không tồn tại." });
            }

            // Kiểm tra Book có tồn tại không
            var book = await _context.Books.FindAsync(borrow.BookId);
            if (book == null)
            {
                return BadRequest(new { message = "Sách không tồn tại." });
            }

            // Kiểm tra sách còn available không
            if (book.AvailableCopies <= 0)
            {
                return BadRequest(new { message = "Sách đã hết, không thể mượn." });
            }

            // Kiểm tra user đã mượn sách này chưa trả chưa
            var existingBorrow = await _context.Borrows
                .AnyAsync(b => b.UserId == borrow.UserId &&
                              b.BookId == borrow.BookId &&
                              b.Status == "borrowed");

            if (existingBorrow)
            {
                return BadRequest(new { message = "User đã mượn sách này và chưa trả." });
            }

            // Set default values
            borrow.BorrowDate = DateTime.Now;
            borrow.DueDate = borrow.DueDate == default ? DateTime.Now.AddDays(14) : borrow.DueDate; // 14 ngày mặc định
            borrow.Status = "borrowed";
            borrow.Createdat = DateTime.Now;
            borrow.Updatedat = DateTime.Now;

            // Giảm AvailableCopies
            book.AvailableCopies--;

            _context.Borrows.Add(borrow);
            await _context.SaveChangesAsync();

            // Load related data for response
            await _context.Entry(borrow)
                .Reference(b => b.User)
                .LoadAsync();
            await _context.Entry(borrow)
                .Reference(b => b.Book)
                .LoadAsync();

            return CreatedAtAction(nameof(GetBorrow), new { id = borrow.Id }, borrow);
        }

        // PUT: api/Borrow/5/return
        [HttpPut("{id}/return")]
        public async Task<IActionResult> ReturnBook(int id, [FromBody] ReturnRequest request = null)
        {
            var borrow = await _context.Borrows
                .Include(b => b.Book)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (borrow == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
            }

            if (borrow.Status != "borrowed")
            {
                return BadRequest(new { message = "Sách đã được trả hoặc trạng thái không hợp lệ." });
            }

            // Cập nhật thông tin trả sách
            borrow.ReturnDate = DateTime.Now;
            borrow.Status = "returned";
            borrow.Notes = request?.Notes ?? borrow.Notes;
            borrow.Updatedat = DateTime.Now;

            // Tăng AvailableCopies
            borrow.Book.AvailableCopies++;

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

        // PUT: api/Borrow/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBorrow(int id, [FromBody] Borrow borrow)
        {
            if (borrow == null)
                return BadRequest("Request body is null");

            if (id != borrow.Id)
            {
                return BadRequest("ID không khớp.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingBorrow = await _context.Borrows.FindAsync(id);
            if (existingBorrow == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
            }

            // Chỉ cho phép cập nhật một số trường
            existingBorrow.DueDate = borrow.DueDate;
            existingBorrow.Notes = borrow.Notes;
            existingBorrow.Updatedat = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BorrowExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Cập nhật phiếu mượn thành công.", borrow = existingBorrow });
        }

        // DELETE: api/Borrow/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBorrow(int id)
        {
            var borrow = await _context.Borrows
                .Include(b => b.Book)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (borrow == null)
            {
                return NotFound(new { message = "Không tìm thấy phiếu mượn này." });
            }

            // Nếu sách chưa trả, tăng lại AvailableCopies
            if (borrow.Status == "borrowed")
            {
                borrow.Book.AvailableCopies++;
            }

            _context.Borrows.Remove(borrow);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa phiếu mượn thành công." });
        }

        private bool BorrowExists(int id)
        {
            return _context.Borrows.Any(e => e.Id == id);
        }
    }

    // Helper class for return request
    public class ReturnRequest
    {
        public string? Notes { get; set; }
    }
}