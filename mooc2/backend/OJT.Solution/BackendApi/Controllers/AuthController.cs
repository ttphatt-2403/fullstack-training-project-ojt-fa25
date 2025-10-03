using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly OjtDbContext _context;

        public AuthController(OjtDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest("Request body is null");

            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password Không được để trống." });
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                return Unauthorized("Sai username hoặc password.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized("Sai username hoặc password.");
            }

            return Ok(new
            {
                Message = "Đăng nhập thành công",
                User = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.Fullname,
                    user.Phone,
                    user.Role
                }
            });
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User request)
        {
            if (request == null)
                return BadRequest("Request body is null");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Kiểm tra ussername có tồn tại không
            var existingUserByUsername = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (existingUserByUsername != null)
            {
                return BadRequest(new { message = "Username đã tồn tại." });
            }
            // Kiểm tra email có tồn tại không
            var existingUserByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUserByEmail != null)
            {
                return BadRequest(new { message = "Email đã tồn tại." });
            }
            // Hash mật khẩu 
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Tạo user mới
            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                Password = hashedPassword,
                Fullname = request.Fullname,
                Phone = request.Phone,
                Role = "user", // Mặc định role là "user"
                Isactive = true,
                Createdat = DateTime.Now,
                Updatedat = DateTime.Now
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đăng ký thành công",
                User = new
                {
                    newUser.Id,
                    newUser.Username,
                    newUser.Email,
                    newUser.Fullname,
                    newUser.Phone,
                    newUser.Role
                }
            });
        }
    }
}
