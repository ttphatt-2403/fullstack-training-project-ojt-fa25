using BackendApi.Dtos;
using BackendApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeeController : ControllerBase
    {
        private readonly OjtDbContext _context;

        public FeeController(OjtDbContext context)
        {
            _context = context;
        }

        // GET: api/Fee?pageNumber=1&pageSize=10&status=&userId=
        [HttpGet]
        public async Task<ActionResult<object>> GetFees([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null, [FromQuery] int? userId = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = _context.Fees
                .Include(f => f.User)
                .Include(f => f.Borrow)
                    .ThenInclude(b => b.Book)
                .AsQueryable();

            // Filter by status if provided
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(f => f.Status == status);
            }

            // Filter by userId if provided
            if (userId.HasValue)
            {
                query = query.Where(f => f.UserId == userId.Value);
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new FeeResponse
                {
                    Id = f.Id,
                    BorrowId = f.BorrowId,
                    UserId = f.UserId,
                    Amount = f.Amount,
                    Type = f.Type,
                    Status = f.Status,
                    PaymentMethod = f.PaymentMethod,
                    CreatedAt = f.CreatedAt,
                    PaidAt = f.PaidAt,
                    Notes = f.Notes,
                    User = new
                    {
                        f.User.Id,
                        f.User.Username,
                        f.User.Fullname,
                        f.User.Email,
                        f.User.Phone
                    },
                    Borrow = new
                    {
                        f.Borrow.Id,
                        f.Borrow.BorrowDate,
                        f.Borrow.DueDate,
                        f.Borrow.ReturnDate,
                        Book = new
                        {
                            f.Borrow.Book.Id,
                            f.Borrow.Book.Title,
                            f.Borrow.Book.Author
                        }
                    }
                })
                .ToListAsync();

            return Ok(new { data = items, pageNumber, pageSize, totalRecords = total, totalPages = (int)Math.Ceiling(total / (double)pageSize) });
        }

        // GET: api/Fee/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FeeResponse>> GetFee(int id)
        {
            var f = await _context.Fees.FindAsync(id);
            if (f == null) return NotFound(new { message = "Không tìm thấy phí." });

            var resp = new FeeResponse
            {
                Id = f.Id,
                BorrowId = f.BorrowId,
                UserId = f.UserId,
                Amount = f.Amount,
                Type = f.Type,
                Status = f.Status,
                PaymentMethod = f.PaymentMethod,
                CreatedAt = f.CreatedAt,
                PaidAt = f.PaidAt,
                Notes = f.Notes
            };

            return Ok(resp);
        }

        // POST: api/Fee
        [HttpPost]
        public async Task<IActionResult> CreateFee([FromBody] CreateFeeRequest dto)
        {
            if (dto == null) return BadRequest("Request body is null");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Validate related entities
            var borrow = await _context.Borrows.FindAsync(dto.BorrowId);
            if (borrow == null) return BadRequest(new { message = "Borrow không tồn tại." });

            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return BadRequest(new { message = "User không tồn tại." });

            var fee = new Fee
            {
                BorrowId = dto.BorrowId,
                UserId = dto.UserId,
                Amount = dto.Amount,
                Type = dto.Type,
                Status = "unpaid",
                PaymentMethod = dto.PaymentMethod,
                Notes = dto.Notes,
                CreatedAt = DateTime.Now
            };

            _context.Fees.Add(fee);
            await _context.SaveChangesAsync();

            var response = new FeeResponse
            {
                Id = fee.Id,
                BorrowId = fee.BorrowId,
                UserId = fee.UserId,
                Amount = fee.Amount,
                Type = fee.Type,
                Status = fee.Status,
                PaymentMethod = fee.PaymentMethod,
                CreatedAt = fee.CreatedAt,
                Notes = fee.Notes
            };

            return CreatedAtAction(nameof(GetFee), new { id = fee.Id }, response);
        }

        // PUT: api/Fee/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFee(int id, [FromBody] UpdateFeeRequest dto)
        {
            if (dto == null || id != dto.Id) return BadRequest();
            var fee = await _context.Fees.FindAsync(id);
            if (fee == null) return NotFound();

            if (dto.Amount.HasValue) fee.Amount = dto.Amount.Value;
            if (dto.Type != null) fee.Type = dto.Type;
            if (dto.Status != null) fee.Status = dto.Status;
            if (dto.PaymentMethod != null) fee.PaymentMethod = dto.PaymentMethod;
            if (dto.Notes != null) fee.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công." });
        }

        // PATCH: api/Fee/5/pay - Thanh toán phí
        [HttpPatch("{id}/pay")]
        public async Task<IActionResult> PayFee(int id, [FromBody] PayFeeRequest? request = null)
        {
            try
            {
                // Tìm fee và update trực tiếp bằng EF (đơn giản hơn raw SQL)
                var fee = await _context.Fees.FirstOrDefaultAsync(f => f.Id == id);
                
                if (fee == null) 
                {
                    return NotFound(new { message = $"Không tìm thấy phí với ID {id}" });
                }
                
                if (fee.Status == "paid") 
                {
                    return BadRequest(new { message = "Phí này đã được thanh toán rồi." });
                }

                // Update fee properties với DateTime an toàn cho PostgreSQL
                fee.Status = "paid";
                
                // Thử nhiều cách để fix DateTime issue
                var now = DateTime.Now;
                fee.PaidAt = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, now.Second, DateTimeKind.Unspecified);
                
                if (!string.IsNullOrEmpty(request?.PaymentMethod)) 
                {
                    fee.PaymentMethod = request.PaymentMethod;
                }
                
                if (!string.IsNullOrEmpty(request?.Notes)) 
                {
                    fee.Notes = request.Notes;
                }

                // Save changes using EF
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Thanh toán thành công!", 
                    feeId = id,
                    paidAt = fee.PaidAt,
                    paymentMethod = fee.PaymentMethod,
                    status = fee.Status
                });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                // Chi tiết lỗi database
                return StatusCode(500, new { 
                    message = "Lỗi database khi thanh toán", 
                    error = dbEx.Message,
                    innerError = dbEx.InnerException?.Message,
                    stackTrace = dbEx.StackTrace
                });
            }
            catch (Exception ex)
            {
                // Lỗi chung
                return StatusCode(500, new { 
                    message = "Lỗi server khi xử lý thanh toán", 
                    error = ex.Message,
                    type = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // ==========================================
        // GET: api/Fee/user/{userId}/statistics
        // ==========================================
        [HttpGet("user/{userId}/statistics")]
        public async Task<ActionResult<object>> GetUserFeeStatistics(int userId)
        {
            // Tổng số phí
            var totalFees = await _context.Fees
                .Where(f => f.UserId == userId)
                .SumAsync(f => (decimal?)f.Amount) ?? 0;

            // Phí chưa thanh toán
            var unpaidFees = await _context.Fees
                .Where(f => f.UserId == userId && f.Status == "unpaid")
                .SumAsync(f => (decimal?)f.Amount) ?? 0;

            // Phí đã thanh toán
            var paidFees = await _context.Fees
                .Where(f => f.UserId == userId && f.Status == "paid")
                .SumAsync(f => (decimal?)f.Amount) ?? 0;

            // Số lượng phí chưa thanh toán
            var unpaidCount = await _context.Fees
                .Where(f => f.UserId == userId && f.Status == "unpaid")
                .CountAsync();

            // Số lượng phí đã thanh toán
            var paidCount = await _context.Fees
                .Where(f => f.UserId == userId && f.Status == "paid")
                .CountAsync();

            return Ok(new
            {
                totalFees,
                unpaidFees,
                paidFees,
                unpaidCount,
                paidCount
            });
        }

        // DELETE: api/Fee/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFee(int id)
        {
            var fee = await _context.Fees.FindAsync(id);
            if (fee == null) return NotFound();

            _context.Fees.Remove(fee);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
