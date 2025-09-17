using System;
using System.Collections.Generic;

namespace BackendApi.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? Fullname { get; set; }

    public string? Phone { get; set; }

    public string? Avatarurl { get; set; }

    public DateOnly? Dateofbirth { get; set; }

    public string? Role { get; set; }

    public bool? Isactive { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }
}
