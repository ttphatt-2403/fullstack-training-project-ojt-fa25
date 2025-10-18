using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendApi.Models;
using BackendApi.Dtos;
using BCrypt.Net;

namespace BackendApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly OjtDbContext _context;

        public UsersController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Fullname = u.Fullname,
                    Phone = u.Phone,
                    Avatarurl = u.Avatarurl,
                    Dateofbirth = u.Dateofbirth,
                    Role = u.Role,
                    Isactive = u.Isactive,
                    Createdat = u.Createdat,
                    Updatedat = u.Updatedat
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Fullname = u.Fullname,
                    Phone = u.Phone,
                    Avatarurl = u.Avatarurl,
                    Dateofbirth = u.Dateofbirth,
                    Role = u.Role,
                    Isactive = u.Isactive,
                    Createdat = u.Createdat,
                    Updatedat = u.Updatedat
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserResponse>> PostUser([FromBody] CreateUserRequest dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                Fullname = dto.Fullname,
                Phone = dto.Phone,
                Avatarurl = dto.Avatarurl,
                Dateofbirth = dto.Dateofbirth,
                Role = dto.Role,
                Isactive = true,
                Createdat = DateTime.Now,
                Updatedat = DateTime.Now
            };

            // Hash password before saving
            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var response = new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Fullname = user.Fullname,
                Phone = user.Phone,
                Avatarurl = user.Avatarurl,
                Dateofbirth = user.Dateofbirth,
                Role = user.Role,
                Isactive = user.Isactive,
                Createdat = user.Createdat,
                Updatedat = user.Updatedat
            };

            return CreatedAtAction("GetUser", new { id = user.Id }, response);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, [FromBody] UpdateUserRequest dto)
        {
            if (dto == null || id != dto.Id)
            {
                return BadRequest();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            // Update only properties that are not null in dto
            if (dto.Fullname != null) user.Fullname = dto.Fullname;
            if (dto.Email != null)
            {
                // simple email validation
                if (!string.IsNullOrWhiteSpace(dto.Email) && !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(dto.Email))
                {
                    return BadRequest(new { Email = "The Email field is not a valid e-mail address." });
                }
                if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
            }
            if (dto.Phone != null) user.Phone = dto.Phone;
            if (dto.Avatarurl != null) user.Avatarurl = dto.Avatarurl;
            if (dto.Dateofbirth != null) user.Dateofbirth = dto.Dateofbirth;
            if (dto.Role != null) user.Role = dto.Role;
            if (dto.Isactive != null) user.Isactive = dto.Isactive;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            user.Updatedat = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id)) return NotFound();
                throw;
            }

            var response = new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Fullname = user.Fullname,
                Phone = user.Phone,
                Avatarurl = user.Avatarurl,
                Dateofbirth = user.Dateofbirth,
                Role = user.Role,
                Isactive = user.Isactive,
                Createdat = user.Createdat,
                Updatedat = user.Updatedat
            };

            return Ok(response);
        }

        // DELETE: api/Users/5
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

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
