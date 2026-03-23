using PaymentService.DTOs;
using PaymentService.Models;
using PaymentService.Repositories;

namespace PaymentService.Services
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> ProcessPaymentAsync(
            PaymentRequestDto dto);
        Task<PaymentResponseDto?> GetByOrderIdAsync(int orderId);
    }

    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repo;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(IPaymentRepository repo,
            ILogger<PaymentService> logger)
        {
            _repo   = repo;
            _logger = logger;
        }

        public async Task<PaymentResponseDto> ProcessPaymentAsync(
            PaymentRequestDto dto)
        {
            // Simulate processing delay
            await Task.Delay(1500);

            string status = dto.PaymentMethod switch
            {
                "Card" => ProcessCard(dto.CardNumber),
                "UPI"  => ProcessUpi(dto.UpiId),
                "COD"  => "Success", // COD always succeeds at order time
                _      => "Failed"
            };

            var transaction = new Transaction
            {
                OrderId       = dto.OrderId,
                UserId        = dto.UserId,
                Amount        = dto.Amount,
                Status        = status,
                PaymentMethod = dto.PaymentMethod,
                ProcessedAt   = DateTime.UtcNow
            };

            await _repo.CreateAsync(transaction);

            _logger.LogInformation(
                "Payment for Order {OrderId} | Method: {Method} | " +
                "Status: {Status}",
                dto.OrderId, dto.PaymentMethod, status);

            return new PaymentResponseDto
            {
                TransactionId = transaction.Id,
                OrderId       = transaction.OrderId,
                Status        = transaction.Status,
                PaymentMethod = transaction.PaymentMethod,
                ProcessedAt   = transaction.ProcessedAt
            };
        }

        private string ProcessCard(string? cardNumber)
        {
            if (string.IsNullOrWhiteSpace(cardNumber))
                return "Failed";

            // Card ending in 0 = Failed simulation
            string lastDigit = cardNumber.Trim().Last().ToString();
            return lastDigit == "0" ? "Failed" : "Success";
        }

        private string ProcessUpi(string? upiId)
        {
            if (string.IsNullOrWhiteSpace(upiId))
                return "Failed";

            // UPI ID must contain @ and have valid format
            // Simulate: UPI IDs ending with @fail = Failed
            if (upiId.EndsWith("@fail", StringComparison
                .OrdinalIgnoreCase))
                return "Failed";

            return "Success";
        }

        public async Task<PaymentResponseDto?> GetByOrderIdAsync(
            int orderId)
        {
            var transaction = await _repo.GetByOrderIdAsync(orderId);
            if (transaction == null) return null;

            return new PaymentResponseDto
            {
                TransactionId = transaction.Id,
                OrderId       = transaction.OrderId,
                Status        = transaction.Status,
                PaymentMethod = transaction.PaymentMethod,
                ProcessedAt   = transaction.ProcessedAt
            };
        }
    }
}