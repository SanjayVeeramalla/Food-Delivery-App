using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentService.DTOs;
using PaymentService.Services;
using System.Security.Claims; // ← this was missing

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger         = logger;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment(
            [FromBody] PaymentRequestDto dto)
        {
            _logger.LogInformation(
                "Processing payment for Order {OrderId}",
                dto.OrderId);

            var result = await _paymentService
                .ProcessPaymentAsync(dto);

            if (result.Status == "Failed")
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetByOrder(int orderId)
        {
            var result = await _paymentService
                .GetByOrderIdAsync(orderId);

            if (result == null)
                return NotFound(
                    new { message = "No transaction found." });

            return Ok(result);
        }

        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetPaymentHistory()
        {
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var history = await _paymentService
                .GetByUserIdAsync(userId);

            return Ok(history);
        }
    }
}