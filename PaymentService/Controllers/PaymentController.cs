using Microsoft.AspNetCore.Mvc;
using PaymentService.DTOs;
using PaymentService.Services;

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
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDto dto)
        {
            _logger.LogInformation(
                "Processing payment for Order {OrderId}, Amount {Amount}",
                dto.OrderId, dto.Amount);

            var result = await _paymentService.ProcessPaymentAsync(dto);

            if (result.Status == "Failed")
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetByOrder(int orderId)
        {
            var result = await _paymentService.GetByOrderIdAsync(orderId);
            if (result == null)
                return NotFound(new { message = "No transaction found for this order." });

            return Ok(result);
        }
    }
}