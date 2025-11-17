using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class CreateFeeRequest
    {
        [Required]
        public int BorrowId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = null!;

        [StringLength(30)]
        public string? PaymentMethod { get; set; }

        public string? Notes { get; set; }
    }
}
