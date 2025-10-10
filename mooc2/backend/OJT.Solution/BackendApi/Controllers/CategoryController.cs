using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly OjtDbContext _context;

        public CategoryController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Category
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryViewModel>>> GetCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryViewModel
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/Category/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryViewModel>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryViewModel
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy thể loại này." });
            }

            return Ok(category);
        }

        // POST: api/Category
        [HttpPost]
        public async Task<ActionResult<CategoryViewModel>> CreateCategory([FromBody] CategoryViewModel model)
        {
            if (model == null)
                return BadRequest("Request body is null");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name.ToLower() == model.Name.ToLower());

            if (existingCategory != null)
            {
                return BadRequest(new { message = "Tên thể loại đã tồn tại." });
            }

            var category = new Category
            {
                Name = model.Name,
                Description = model.Description,
                Createdat = DateTime.Now,
                Updatedat = DateTime.Now
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new CategoryViewModel
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            });
        }

        // PUT: api/Category/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryViewModel model)
        {
            if (model == null)
                return BadRequest("Request body is null");

            if (id != model.Id)
            {
                return BadRequest("ID không khớp.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return NotFound(new { message = "Không tìm thấy thể loại này." });
            }

            var duplicateCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name.ToLower() == model.Name.ToLower() && c.Id != id);

            if (duplicateCategory != null)
            {
                return BadRequest(new { message = "Tên thể loại đã tồn tại." });
            }

            existingCategory.Name = model.Name;
            existingCategory.Description = model.Description;
            existingCategory.Updatedat = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new CategoryViewModel
            {
                Id = existingCategory.Id,
                Name = existingCategory.Name,
                Description = existingCategory.Description
            });
        }

        // DELETE: api/Category/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Books)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new { message = "Không tìm thấy thể loại này." });
            }

            if (category.Books.Any())
            {
                return BadRequest(new { message = "Không thể xóa thể loại này vì còn có sách thuộc thể loại này." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thể loại thành công." });
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.Id == id);
        }
    }
}