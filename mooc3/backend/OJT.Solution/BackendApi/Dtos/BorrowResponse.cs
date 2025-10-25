using System;

namespace BackendApi.Dtos
{
    public class BorrowResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Status { get; set; } = "borrowed";
        public string? Notes { get; set; }
        public DateTime? Createdat { get; set; }
        public DateTime? Updatedat { get; set; }

        // Simple nested info for response
        public object? User { get; set; }
        public object? Book { get; set; }
    }
}
