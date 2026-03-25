using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> CreateAsync(Order order);
        Task<List<Order>> GetByUserIdAsync(int userId);
        Task<Order?> GetByIdAsync(int orderId);
        Task UpdateStatusAsync(int orderId, string status);
        Task<List<Order>> GetActiveOrdersAsync();
        Task<List<Order>> GetAllOrdersAsync(); 
    }

    public class OrderRepository : IOrderRepository
    {
        private readonly OrderDbContext _context;

        public OrderRepository(OrderDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateAsync(Order order)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_PlaceOrder @UserId = {0}, @RestaurantId = {1}, " +
                "@TotalAmount = {2}, @DeliveryAddress = {3}, " +
                "@PaymentMethod = {4}",
                order.UserId,
                order.RestaurantId,
                order.TotalAmount,
                order.DeliveryAddress ?? (object)DBNull.Value,
                order.PaymentMethod);

            order.Id = await _context.Orders
                .Where(o => o.UserId == order.UserId &&
                            o.RestaurantId == order.RestaurantId)
                .OrderByDescending(o => o.Id)
                .Select(o => o.Id)
                .FirstOrDefaultAsync();

            foreach (var item in order.Items)
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_AddOrderItem @OrderId = {0}, @MenuItemId = {1}, " +
                    "@ItemName = {2}, @Quantity = {3}, @UnitPrice = {4}",
                    order.Id,
                    item.MenuItemId,
                    item.ItemName,
                    item.Quantity,
                    item.UnitPrice);

                item.OrderId = order.Id;
            }

            return order;
        }

        public async Task<List<Order>> GetByUserIdAsync(int userId)
        {
            // Get orders
            var orders = await _context.Orders
                .FromSqlRaw(
                    "EXEC sp_GetOrdersByUser @UserId = {0}", userId)
                .AsNoTracking()
                .ToListAsync();

            // Get items for each order
            foreach (var order in orders)
            {
                order.Items = await _context.OrderItems
                    .FromSqlRaw(
                        "EXEC sp_GetOrderItems @OrderId = {0}", order.Id)
                    .AsNoTracking()
                    .ToListAsync();
            }

            return orders;
        }

        public async Task<Order?> GetByIdAsync(int orderId)
        {
            var result = await _context.Orders
                .FromSqlRaw(
                    "EXEC sp_GetOrderById @OrderId = {0}", orderId)
                .AsNoTracking()
                .ToListAsync();

            var order = result.FirstOrDefault();
            if (order == null) return null;

            order.Items = await _context.OrderItems
                .FromSqlRaw(
                    "EXEC sp_GetOrderItems @OrderId = {0}", orderId)
                .AsNoTracking()
                .ToListAsync();

            return order;
        }

        public async Task<List<Order>> GetAllOrdersAsync()
{
    return await _context.Orders
        .FromSqlRaw("EXEC sp_GetAllOrders")
        .AsNoTracking()
        .ToListAsync();
}

        public async Task UpdateStatusAsync(int orderId, string status)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_UpdateOrderStatus @OrderId = {0}, @Status = {1}",
                orderId, status);
        }

        public async Task<List<Order>> GetActiveOrdersAsync()
        {
            return await _context.Orders
                .FromSqlRaw("EXEC sp_GetActiveOrders")
                .AsNoTracking()
                .ToListAsync();
        }
    }
}