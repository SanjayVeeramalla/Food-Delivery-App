using System.ComponentModel.DataAnnotations;

namespace OrderService.DTOs
{
    public class PlaceOrderDto
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        public string DeliveryAddress { get; set; } = string.Empty;

        // Payment method: Card, UPI, COD
        [Required]
        public string PaymentMethod { get; set; } = "Card";

        // For Card payment
        public string? CardNumber { get; set; }

        // For UPI payment
        public string? UpiId { get; set; }

        [Required]
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        [Required]
        public int MenuItemId { get; set; }

        [Required]
        public string ItemName { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }
    }
}