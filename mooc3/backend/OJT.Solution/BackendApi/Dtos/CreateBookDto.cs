using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class CreateBookDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Author { get; set; }  
        public string Isbn { get; set; }
        public string Publisher { get; set; }
        public DateTime PublishedDate { get; set; }
        public string Description { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public string ImageUrl { get; set; }
        [Required]
        public int CategoryId { get; set; }
    }
}
