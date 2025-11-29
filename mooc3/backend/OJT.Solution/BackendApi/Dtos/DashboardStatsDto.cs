namespace BackendApi.Dtos
{
    public class TopCategoryDto
    {
        public string Category { get; set; }
        public int Count { get; set; }
    }

    public class TopBookDto
    {
        public string Title { get; set; }
        public int BorrowCount { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalBooks { get; set; }
        public int BooksBorrowed { get; set; }
        public int BooksAvailable { get; set; }
        public int TotalUsers { get; set; }
        public int AdminCount { get; set; }
        public int StaffCount { get; set; }
        public int UserCount { get; set; }
        public int BorrowsToday { get; set; }
        public int BorrowsThisWeek { get; set; }
        public int BorrowsThisMonth { get; set; }
        public List<TopCategoryDto> TopCategories { get; set; }
        public List<TopBookDto> TopBooks { get; set; }
    }
}
