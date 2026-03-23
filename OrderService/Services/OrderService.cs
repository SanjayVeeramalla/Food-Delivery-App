using OrderService.DTOs;
using OrderService.Models;
using OrderService.Repositories;

namespace OrderService.Services
{
    public interface IOrderService
    {
        Task<OrderResponseDto?> PlaceOrderAsync(PlaceOrderDto dto, int userId);
        Task<List<Order>> GetOrdersByUserAsync(int userId);
        Task<Order?> GetOrderByIdAsync(int orderId);
    }

    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<OrderService> _logger;

        public OrderService(IOrderRepository orderRepo,
            IHttpClientFactory httpClientFactory,
            ILogger<OrderService> logger)
        {
            _orderRepo = orderRepo;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<OrderResponseDto?> PlaceOrderAsync(
     PlaceOrderDto dto, int userId)
        {
            decimal total = dto.Items.Sum(i => i.Quantity * i.UnitPrice);

            var order = new Order
            {
                UserId = userId,
                RestaurantId = dto.RestaurantId,
                TotalAmount = total,
                DeliveryAddress = dto.DeliveryAddress,
                Status = "Pending",
                PaymentMethod = dto.PaymentMethod  // add this
            };

            order.Items = dto.Items.Select(i => new OrderItem
            {
                MenuItemId = i.MenuItemId,
                ItemName = i.ItemName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList();

            await _orderRepo.CreateAsync(order);

            bool paymentSuccess = await ProcessPaymentAsync(
                order.Id, userId, total, dto);

            order.Status = paymentSuccess ? "Confirmed" : "Failed";
            await _orderRepo.UpdateStatusAsync(order.Id, order.Status);

            return MapToResponseDto(order);
        }

        private async Task<bool> ProcessPaymentAsync(
    int orderId, int userId, decimal amount, PlaceOrderDto dto)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("PaymentService");

                var payload = new
                {
                    OrderId = orderId,
                    UserId = userId,
                    Amount = amount,
                    PaymentMethod = dto.PaymentMethod,
                    CardNumber = dto.CardNumber,
                    UpiId = dto.UpiId
                };

                var response = await client.PostAsJsonAsync(
                    "/api/payments/process", payload);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Payment failed for Order {OrderId}", orderId);
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Payment service call failed for Order {OrderId}", orderId);
                return false;
            }
        }

        private static OrderResponseDto MapToResponseDto(Order order)
        {
            return new OrderResponseDto
            {
                Id = order.Id,
                UserId = order.UserId,
                RestaurantId = order.RestaurantId,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                DeliveryAddress = order.DeliveryAddress,
                PaymentMethod = order.PaymentMethod,   // add this
                PlacedAt = order.PlacedAt,
                UpdatedAt = order.UpdatedAt,
                Items = order.Items.Select(i => new OrderItemResponseDto
                {
                    Id = i.Id,
                    MenuItemId = i.MenuItemId,
                    ItemName = i.ItemName,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            };
        }

        public async Task<List<Order>> GetOrdersByUserAsync(int userId)
        {
            return await _orderRepo.GetByUserIdAsync(userId);
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            return await _orderRepo.GetByIdAsync(orderId);
        }
    }
}