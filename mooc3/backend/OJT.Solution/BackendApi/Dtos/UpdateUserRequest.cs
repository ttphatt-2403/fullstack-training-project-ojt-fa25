using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class UpdateUserRequest
    {
        [Required]
        public int Id { get; set; }

        [StringLength(100)]
        public string? Fullname { get; set; }

    public string? Email { get; set; }

        [StringLength(100, MinimumLength = 6)]
        public string? Password { get; set; }

        public string? Phone { get; set; }
        public string? Avatarurl { get; set; }
        public DateOnly? Dateofbirth { get; set; }
        public string? Role { get; set; }
        public bool? Isactive { get; set; }
    }
}
