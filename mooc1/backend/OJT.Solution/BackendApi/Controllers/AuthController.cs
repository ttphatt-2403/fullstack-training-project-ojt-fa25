using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;

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

            if (user.Password != request.Password)
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
    }
}
