using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly OjtDbContext _context;
        private readonly IConfiguration _configuration; // THÊM

        public AuthController(OjtDbContext context, IConfiguration configuration) // SỬA
        {
            _context = context;
            _configuration = configuration;
        }

        private string GenerateJwtToken(User user)
        {
            var secret = _configuration["Jwt:Key"]; // LẤY TỪ appsettings.json
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
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

            if (!(user.Isactive ?? false))
            {
                return Unauthorized("Tài khoản đã bị khóa.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized("Sai username hoặc password.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Message = "Đăng nhập thành công",
                Token = token,
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

        //endpoint /me để lấy thông tin user hiện tại
        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Token không hợp lệ");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("Không tìm thấy user");
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Fullname,
                user.Phone,
                user.Role,
                user.Isactive
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
