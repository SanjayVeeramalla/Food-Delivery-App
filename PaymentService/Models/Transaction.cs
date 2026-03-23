namespace PaymentService.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Pending";
        public string PaymentMethod { get; set; } = "Card";
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    }
}