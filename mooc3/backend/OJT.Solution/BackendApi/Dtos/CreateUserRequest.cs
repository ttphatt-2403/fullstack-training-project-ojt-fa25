using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class CreateUserRequest
    {
        [Required]
        [StringLength(100)]
        public string Username { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = null!;

        public string? Fullname { get; set; }
        public string? Phone { get; set; }
        public string? Avatarurl { get; set; }
        public DateOnly? Dateofbirth { get; set; }
        public string? Role { get; set; }
    }
}
