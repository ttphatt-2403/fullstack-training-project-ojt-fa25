using System;

namespace BackendApi.Dtos
{
    public class FeeResponse
    {
        public int Id { get; set; }
        public int BorrowId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = null!;
        public string Status { get; set; } = "unpaid";
        public string? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? Notes { get; set; }

        public object? Borrow { get; set; }
        public object? User { get; set; }
    }
}
