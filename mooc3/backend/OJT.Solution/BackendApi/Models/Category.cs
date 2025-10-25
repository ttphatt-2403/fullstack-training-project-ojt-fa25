using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Models;

public partial class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }

    // Navigation property: Một thể loại có nhiều sách
    public virtual ICollection<Book> Books { get; set; } = new List<Book>();
}