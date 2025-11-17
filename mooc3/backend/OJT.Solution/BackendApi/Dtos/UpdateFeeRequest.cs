using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class UpdateFeeRequest
    {
        [Required]
        public int Id { get; set; }

        [Range(0.0, 1000000000.0)]
        public decimal? Amount { get; set; }

        [StringLength(50)]
        public string? Type { get; set; }

        [StringLength(20)]
        public string? Status { get; set; }

        [StringLength(30)]
        public string? PaymentMethod { get; set; }

        public string? Notes { get; set; }
    }
}
