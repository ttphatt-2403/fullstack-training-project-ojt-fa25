using System.Collections.Generic;

namespace BackendApi.Dtos
{
    public class StaffDashboardStatsDto
    {
        public int BooksBorrowed { get; set; }
        public int BorrowsToday { get; set; }
        public int BorrowsThisWeek { get; set; }
        public int BorrowsThisMonth { get; set; }
        public int ActiveUsers { get; set; }
        public List<TopBookDto> TopBooks { get; set; }
    }
}
