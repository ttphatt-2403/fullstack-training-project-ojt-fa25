using BackendApi.Libraries;
using BackendApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VnPayController : ControllerBase
    {
        private readonly OjtDbContext _context;
        private readonly IConfiguration _configuration;

        public VnPayController(OjtDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("CreatePaymentUrl")]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] VnPayPaymentRequest request)
        {
            var fee = await _context.Fees.FindAsync(request.FeeId);
            if (fee == null || fee.Status != "unpaid")
            {
                return BadRequest("Fee not found or already paid.");
            }

            // TEMP: Update DB immediately for demo (normally done by IPN)
            // fee.Status = "paid";
            // fee.PaymentMethod = "vnpay";
            // fee.PaidAt = DateTime.Now;
            // fee.Notes = "VNPay payment (demo - normally updated by IPN)";
            // await _context.SaveChangesAsync();
            // Console.WriteLine($"Fee {fee.Id} updated to paid in CreatePaymentUrl");

            // Get VNPay config
            var vnp_TmnCode = _configuration["Vnpay:TmnCode"]!;
            var vnp_HashSecret = _configuration["Vnpay:HashSecret"]!;
            var vnp_Url = _configuration["Vnpay:BaseUrl"]!;
            var vnp_Returnurl = _configuration["Vnpay:ReturnUrl"]!;

            // Create VNPay library instance
            var vnpay = new VnPayLibrary();

            // Add request data
            vnpay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]!);
            vnpay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]!);
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)(fee.Amount * 100)).ToString()); // Nhân với 100 để loại bỏ thập phân
            vnpay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]!);
            vnpay.AddRequestData("vnp_TxnRef", fee.Id.ToString());
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan phi: {fee.Type} - {fee.Id}");
            vnpay.AddRequestData("vnp_OrderType", "billpayment");
            vnpay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]!);
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl);
            vnpay.AddRequestData("vnp_IpAddr", GetIpAddress());
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));

            // Optional: vnp_BankCode - để test với ngân hàng cụ thể
            vnpay.AddRequestData("vnp_BankCode", "VNBANK"); // Thẻ ATM nội địa

            var paymentUrl = vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);

            return Ok(new { PaymentUrl = paymentUrl });
        }

        [HttpPost("Ipn")]
        public async Task<IActionResult> Ipn([FromForm] VnPayIpnRequest request)
        {
            Console.WriteLine("IPN received!");
            var vnp_HashSecret = _configuration["Vnpay:HashSecret"]!;

            var vnpay = new VnPayLibrary();

            // Add all form data to vnpay
            var properties = typeof(VnPayIpnRequest).GetProperties();
            foreach (var prop in properties)
            {
                var value = prop.GetValue(request)?.ToString();
                if (!string.IsNullOrEmpty(value))
                {
                    vnpay.AddResponseData(prop.Name, value);
                }
            }

            var vnp_SecureHash = vnpay.GetResponseData("vnp_SecureHash");
            var checkSignature = vnpay.ValidateSignature(vnp_SecureHash, vnp_HashSecret);

            // Debug logging
            Console.WriteLine($"Received vnp_SecureHash: {vnp_SecureHash}");
            Console.WriteLine($"CheckSignature result: {checkSignature}");

            if (!checkSignature)
            {
                return new JsonResult(new { RspCode = "97", Message = "Invalid signature" });
            }

            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            var vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");

            if (int.TryParse(vnp_TxnRef, out var feeId))
            {
                var fee = await _context.Fees.FindAsync(feeId);
                if (fee != null && fee.Status == "unpaid")
                {
                    if (vnp_ResponseCode == "00")
                    {
                        fee.Status = "paid";
                        fee.PaymentMethod = "vnpay";
                        fee.PaidAt = DateTime.Now;
                        fee.Notes = $"VNPay transaction: {vnpay.GetResponseData("vnp_TransactionNo")}";
                    }
                    else
                    {
                        fee.Status = "failed";
                        fee.Notes = $"VNPay failed: {vnp_ResponseCode}";
                    }
                    await _context.SaveChangesAsync();
                    return new JsonResult(new { RspCode = "00", Message = "Confirm Success" });
                }
                else if (fee != null && fee.Status == "paid")
                {
                    return new JsonResult(new { RspCode = "02", Message = "Order already confirmed" });
                }
            }

            return new JsonResult(new { RspCode = "01", Message = "Order not found" });
        }

        [HttpPost("ConfirmPayment")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            var fee = await _context.Fees.FindAsync(request.FeeId);
            if (fee == null || fee.Status == "paid")
            {
                return Ok(new { success = false, message = "Fee not found or already paid" });
            }

            // Update DB (simulate IPN logic)
            fee.Status = "paid";
            fee.PaymentMethod = "vnpay";
            fee.PaidAt = DateTime.Now;
            fee.Notes = "VNPay payment confirmed from return params";
            await _context.SaveChangesAsync();

            Console.WriteLine($"Fee {fee.Id} confirmed as paid");
            return Ok(new { success = true, message = "Payment confirmed" });
        }

        [HttpGet("Return")]
        public IActionResult Return()
        {
            var vnp_HashSecret = _configuration["Vnpay:HashSecret"]!;

            var vnpayData = Request.Query;
            var vnpay = new VnPayLibrary();

            foreach (var kv in vnpayData)
            {
                vnpay.AddResponseData(kv.Key, kv.Value!);
            }

            var vnp_SecureHash = vnpayData["vnp_SecureHash"];
            var checkSignature = vnpay.ValidateSignature(vnp_SecureHash!, vnp_HashSecret);

            Console.WriteLine($"Return endpoint called");
            Console.WriteLine($"vnp_SecureHash: {vnp_SecureHash}");
            Console.WriteLine($"checkSignature: {checkSignature}");

            if (!checkSignature)
            {
                Console.WriteLine("Signature invalid, redirecting to cancel");
                return Redirect("http://localhost:3000/payment/cancel");
            }

            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            Console.WriteLine($"vnp_ResponseCode: {vnp_ResponseCode}");

            if (vnp_ResponseCode == "00")
            {
                Console.WriteLine("Response code 00, redirecting to success");
                return Redirect("http://localhost:3000/payment/success");
            }
            else
            {
                Console.WriteLine($"Response code {vnp_ResponseCode}, redirecting to cancel");
                return Redirect("http://localhost:3000/payment/cancel");
            }
        }

        [HttpGet("GetBankList")]
        public IActionResult GetBankList()
        {
            // Mock bank list for demo
            var banks = new[]
            {
                new { code = "NCB", name = "Ngân hàng Quốc Dân" },
                new { code = "SACOMBANK", name = "Ngân hàng Sài Gòn Thương Tín" },
                new { code = "EXIMBANK", name = "Ngân hàng Xuất Nhập Khẩu" },
                new { code = "MSBANK", name = "Ngân hàng Hàng Hải" },
                new { code = "NAMABANK", name = "Ngân hàng Nam Á" },
                new { code = "VISA", name = "Thẻ Visa" },
                new { code = "MASTERCARD", name = "Thẻ MasterCard" }
            };

            return Ok(banks);
        }

        private string GetIpAddress()
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1")
            {
                ipAddress = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            }
            if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1")
            {
                ipAddress = HttpContext.Connection.LocalIpAddress?.ToString();
            }
            return ipAddress ?? "127.0.0.1";
        }
    }
}

public class VnPayPaymentRequest
{
    public int FeeId { get; set; }
}

public class ConfirmPaymentRequest
{
    public int FeeId { get; set; }
    public Dictionary<string, string>? Params { get; set; }
}

public class VnPayIpnRequest
{
    public string? vnp_Amount { get; set; }
    public string? vnp_BankCode { get; set; }
    public string? vnp_BankTranNo { get; set; }
    public string? vnp_CardType { get; set; }
    public string? vnp_OrderInfo { get; set; }
    public string? vnp_PayDate { get; set; }
    public string? vnp_ResponseCode { get; set; }
    public string? vnp_TmnCode { get; set; }
    public string? vnp_TransactionNo { get; set; }
    public string? vnp_TransactionStatus { get; set; }
    public string? vnp_TxnRef { get; set; }
    public string? vnp_SecureHash { get; set; }
}
