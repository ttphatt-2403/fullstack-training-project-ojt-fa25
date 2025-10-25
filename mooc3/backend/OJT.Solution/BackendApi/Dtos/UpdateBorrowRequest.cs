using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class UpdateBorrowRequest
    {
        [Required]
        public int Id { get; set; }

        public DateTime? DueDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
