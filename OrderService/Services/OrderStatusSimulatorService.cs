using OrderService.Repositories;
namespace OrderService.Services
{
    public class OrderStatusSimulatorService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<OrderStatusSimulatorService> _logger;

        public OrderStatusSimulatorService(
            IServiceScopeFactory scopeFactory,
            ILogger<OrderStatusSimulatorService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger       = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                await ProgressOrderStatuses();
            }
        }

        private async Task ProgressOrderStatuses()
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider
                .GetRequiredService<IOrderRepository>();

            var orders = await repo.GetActiveOrdersAsync();

            foreach (var order in orders)
            {
                string nextStatus = order.Status switch
                {
                    "Confirmed"      => "Preparing",
                    "Preparing"      => "OutForDelivery",
                    "OutForDelivery" => "Delivered",
                    _                => order.Status
                };

                if (nextStatus != order.Status)
                {
                    await repo.UpdateStatusAsync(order.Id, nextStatus);
                    _logger.LogInformation(
                        "Order {OrderId} progressed from {Old} to {New}",
                        order.Id, order.Status, nextStatus);
                }
            }
        }
    }
}