using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class CreateBorrowRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        public DateTime? BorrowDate { get; set; }

        public DateTime? DueDate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
