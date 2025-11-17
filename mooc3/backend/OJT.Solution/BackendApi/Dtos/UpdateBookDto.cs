using System;

namespace BackendApi.Dtos
{
    public class UpdateBookDto
    {
        // Nếu frontend chỉ gửi một vài trường khi update, để các string nullable
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Isbn { get; set; }
        public string? Publisher { get; set; }

        // DTO dùng DateTime? để binder nhận ISO string từ frontend; controller sẽ convert sang DateOnly nếu cần
        public DateTime? PublishedDate { get; set; }

        public string? Description { get; set; }

        // numeric fields nullable để controller biết client có gửi hay không
        public int? TotalCopies { get; set; }
        public int? AvailableCopies { get; set; }

        public string? ImageUrl { get; set; }

        // CategoryId nullable: nếu client không muốn thay đổi category, nó có thể bỏ qua
        public int? CategoryId { get; set; }
    }
}