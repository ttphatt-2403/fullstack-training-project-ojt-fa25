using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendApi.Models;

public partial class Book
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(100)]
    public string? Author { get; set; }

    [StringLength(50)]
    public string? Isbn { get; set; }

    [StringLength(100)]
    public string? Publisher { get; set; }

    public DateOnly? PublishedDate { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    public int? TotalCopies { get; set; }

    public int? AvailableCopies { get; set; }

    public string? ImageUrl { get; set; }

    // Foreign Key cho Category
    [Required]
    public int CategoryId { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }

    // Navigation properties
    [ForeignKey("CategoryId")]
    public virtual Category Category { get; set; } = null!;

    // Một sách có thể có nhiều phiếu mượn
    public virtual ICollection<Borrow> Borrows { get; set; } = new List<Borrow>();
}