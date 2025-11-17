using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendApi.Models;

public partial class Fee
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Borrow")]
    public int BorrowId { get; set; }

    [ForeignKey("User")]
    public int UserId { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = null!;  // "late_fee", "damage_fee", etc.

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "unpaid"; // "unpaid", "paid", "cancelled"

    [MaxLength(30)]
    public string? PaymentMethod { get; set; } // "cash", "credit_card", etc.

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime? PaidAt { get; set; }

    public string? Notes { get; set; } // Mô tả chi tiết lý do thu phí

    // Navigation properties
    public virtual Borrow Borrow { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
