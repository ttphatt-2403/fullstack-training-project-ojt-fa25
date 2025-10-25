using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendApi.Models;

public partial class Borrow
{
    public int Id { get; set; }

    // Foreign Key cho User
    [Required]
    public int UserId { get; set; }

    // Foreign Key cho Book
    [Required]
    public int BookId { get; set; }

    [Required]
    public DateTime BorrowDate { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    public DateTime? ReturnDate { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = "borrowed"; // borrowed, returned, overdue

    [StringLength(500)]
    public string? Notes { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("BookId")]
    public virtual Book Book { get; set; } = null!;
}