namespace BackendApi.Dtos
{
    public class PayFeeRequest
    {
        public string? PaymentMethod { get; set; }
        public string? Notes { get; set; }
    }
}