using BackendApi.Dtos;
using BackendApi.Models;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;

namespace BackendApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        // ...existing code...

        // PATCH: api/Users/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchUser(int id, [FromBody] PatchUserRequest dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }
            // Chỉ cập nhật trường Isactive nếu có truyền lên
            if (dto.Isactive.HasValue)
            {
                user.Isactive = dto.Isactive.Value;
            }
            user.Updatedat = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công", isActive = user.Isactive });
        }

        public class PatchUserRequest
        {
            public bool? Isactive { get; set; }
        }


        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<UserResponse>>> SearchUsers([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return BadRequest("Keyword is required.");
            }

            // Hàm xóa dấu tiếng Việt, viết luôn trong action
            string RemoveDiacritics(string text)
            {
                var normalized = text.Normalize(NormalizationForm.FormD);
                var sb = new StringBuilder();
                foreach (var c in normalized)
                {
                    if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                        sb.Append(c);
                }
                return sb.ToString().Normalize(NormalizationForm.FormC).ToLower();
            }

            var keywordNorm = RemoveDiacritics(keyword);

            var allUsers = await _context.Users.ToListAsync();
            var filtered = allUsers.Where(u =>
                RemoveDiacritics(u.Fullname ?? "").Contains(keywordNorm) ||
                RemoveDiacritics(u.Username ?? "").Contains(keywordNorm) ||
                RemoveDiacritics(u.Email ?? "").Contains(keywordNorm)
            ).Select(u => new UserResponse
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
            }).ToList();

            return Ok(filtered);
        }
        private readonly OjtDbContext _context;

        public UsersController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<object>> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = _context.Users
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
                });

            var totalUsers = await query.CountAsync();
            var users = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                data = users,
                pageNumber,
                pageSize,
                totalUsers,
                totalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
            });
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
