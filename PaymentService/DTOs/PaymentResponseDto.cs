namespace PaymentService.DTOs;
public class PaymentResponseDto
{
    public int TransactionId { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }  // add this
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}