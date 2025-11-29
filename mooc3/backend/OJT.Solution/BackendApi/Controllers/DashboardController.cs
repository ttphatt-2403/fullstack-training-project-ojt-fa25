using System.Threading.Tasks;
using BackendApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BackendApi.Controllers
{
    [Route("api/dashboard")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _dashboardService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("staff-stats")]
        [Authorize(Roles = "Staff,Admin,staff,admin")]
        public async Task<IActionResult> GetStaffDashboardStats()
        {
            var stats = await _dashboardService.GetStaffDashboardStatsAsync();
            return Ok(stats);
        }

        [HttpGet("user-stats")]
        [Authorize(Roles = "User,user,Admin,admin,Staff,staff")]
        public async Task<IActionResult> GetUserDashboardStats()
        {
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();
            var stats = await _dashboardService.GetUserDashboardStatsAsync(userId);
            return Ok(stats);
        }
    }
}
