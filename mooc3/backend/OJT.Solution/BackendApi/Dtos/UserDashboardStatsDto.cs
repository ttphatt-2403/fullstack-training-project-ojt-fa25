using System.Collections.Generic;

namespace BackendApi.Dtos
{
    public class UserDashboardStatsDto
    {
        public int TotalBorrowed { get; set; }
        public int CurrentlyBorrowing { get; set; }
        public int ReturnedBooks { get; set; }
        public List<UserBookHistoryDto> BorrowHistory { get; set; }
        public List<TopBookDto> SuggestedBooks { get; set; }
    }

    public class UserBookHistoryDto
    {
        public string Title { get; set; }
        public string Status { get; set; }
        public string BorrowDate { get; set; }
        public string ReturnDate { get; set; }
    }
}
