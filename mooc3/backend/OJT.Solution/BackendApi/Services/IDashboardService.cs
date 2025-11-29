using System.Collections.Generic;
using System.Threading.Tasks;
using BackendApi.Dtos;

namespace BackendApi.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<StaffDashboardStatsDto> GetStaffDashboardStatsAsync();
        Task<UserDashboardStatsDto> GetUserDashboardStatsAsync(int userId);
    }
}
