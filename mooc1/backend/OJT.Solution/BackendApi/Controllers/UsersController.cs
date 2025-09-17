using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendApi.Models;    

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController] 
    public class UsersController : Controller
    {
        private readonly OjtDbContext _context;
        public UsersController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]   
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/id
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        //POST: api/Users   
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // PUT: api/Users/id
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest("ID không khớp");
            }

            // Tìm user hiện tại trong database
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
            {
                return NotFound("Không tìm thấy user");
            }

            // Cập nhật từng field thay vì dùng EntityState.Modified
            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.Fullname = user.Fullname;
            existingUser.Phone = user.Phone;
            existingUser.Role = user.Role;
            existingUser.Updatedat = DateTime.Now;

            // Chỉ cập nhật password nếu có giá trị
            if (!string.IsNullOrEmpty(user.Password))
            {
                existingUser.Password = user.Password;
            }

            // Không cần set EntityState.Modified vì đã track entity
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Users.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Users/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();  
            return NoContent();
        }
    }
}
