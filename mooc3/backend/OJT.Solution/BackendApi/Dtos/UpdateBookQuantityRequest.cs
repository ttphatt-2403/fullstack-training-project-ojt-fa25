using System.ComponentModel.DataAnnotations;

namespace BackendApi.Dtos
{
    public class UpdateBookQuantityRequest
    {
        [Range(0, int.MaxValue, ErrorMessage = "Tổng số sách phải >= 0")]
        public int? TotalCopies { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Số sách có sẵn phải >= 0")]
        public int? AvailableCopies { get; set; }
    }
}