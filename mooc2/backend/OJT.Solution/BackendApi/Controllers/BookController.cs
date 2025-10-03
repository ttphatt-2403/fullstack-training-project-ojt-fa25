using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
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

        // GET: api/Book
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBooks()
        {
            var books = await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Borrows)
                .OrderBy(b => b.Title)
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

            return Ok(books);
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
        public async Task<ActionResult<IEnumerable<object>>> SearchBooks([FromQuery] string query = "")
        {
            var books = _context.Books
                .Include(b => b.Category)
                .AsQueryable();

            if (!string.IsNullOrEmpty(query))
            {
                books = books.Where(b =>
                    b.Title.ToLower().Contains(query.ToLower()) ||
                    b.Author.ToLower().Contains(query.ToLower()) ||
                    b.Isbn.Contains(query) ||
                    b.Category.Name.ToLower().Contains(query.ToLower())
                );
            }

            var result = await books
                .OrderBy(b => b.Title)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Isbn,
                    b.Publisher,
                    b.AvailableCopies,
                    Category = new
                    {
                        b.Category.Id,
                        b.Category.Name
                    }
                })
                .ToListAsync();

            return Ok(result);
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
        public async Task<ActionResult<Book>> CreateBook([FromBody] Book book)
        {
            if (book == null)
                return BadRequest("Request body is null");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra CategoryId có tồn tại không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == book.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Thể loại không tồn tại." });
            }

            // Kiểm tra ISBN đã tồn tại chưa (nếu có)
            if (!string.IsNullOrEmpty(book.Isbn))
            {
                var existingBook = await _context.Books
                    .FirstOrDefaultAsync(b => b.Isbn == book.Isbn);

                if (existingBook != null)
                {
                    return BadRequest(new { message = "ISBN đã tồn tại." });
                }
            }

            // Set default values
            book.TotalCopies = book.TotalCopies ?? 1;
            book.AvailableCopies = book.AvailableCopies ?? book.TotalCopies;
            book.Createdat = DateTime.Now;
            book.Updatedat = DateTime.Now;

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            // Load category for response
            await _context.Entry(book)
                .Reference(b => b.Category)
                .LoadAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        // PUT: api/Book/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
        {
            if (book == null)
                return BadRequest("Request body is null");

            if (id != book.Id)
            {
                return BadRequest("ID không khớp.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingBook = await _context.Books.FindAsync(id);
            if (existingBook == null)
            {
                return NotFound(new { message = "Không tìm thấy sách này." });
            }

            // Kiểm tra CategoryId có tồn tại không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == book.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Thể loại không tồn tại." });
            }

            // Kiểm tra ISBN đã tồn tại chưa (trừ chính nó)
            if (!string.IsNullOrEmpty(book.Isbn))
            {
                var duplicateBook = await _context.Books
                    .FirstOrDefaultAsync(b => b.Isbn == book.Isbn && b.Id != id);

                if (duplicateBook != null)
                {
                    return BadRequest(new { message = "ISBN đã tồn tại." });
                }
            }

            // Update fields
            existingBook.Title = book.Title;
            existingBook.Author = book.Author;
            existingBook.Isbn = book.Isbn;
            existingBook.Publisher = book.Publisher;
            existingBook.PublishedDate = book.PublishedDate;
            existingBook.Description = book.Description;
            existingBook.TotalCopies = book.TotalCopies;
            existingBook.AvailableCopies = book.AvailableCopies;
            existingBook.ImageUrl = book.ImageUrl;
            existingBook.CategoryId = book.CategoryId;
            existingBook.Updatedat = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Cập nhật sách thành công.", book = existingBook });
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