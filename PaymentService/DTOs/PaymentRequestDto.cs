using System.ComponentModel.DataAnnotations;

namespace PaymentService.DTOs
{
    public class PaymentRequestDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        // Payment method: Card, UPI, COD
        [Required]
        public string PaymentMethod { get; set; } = "Card";

        // For Card payments — 16 digit number
        public string? CardNumber { get; set; }

        // For UPI payments — UPI ID like name@upi
        public string? UpiId { get; set; }
    }

    public class PaymentResponseDto
    {
        public int TransactionId { get; set; }
        public int OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
    }
}