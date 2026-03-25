using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Models;

namespace PaymentService.Repositories
{
    public interface IPaymentRepository
    {
        Task<Transaction> CreateAsync(Transaction transaction);
        Task<Transaction?> GetByOrderIdAsync(int orderId);
        Task<List<Transaction>> GetByUserIdAsync(int userId);
    }

    public class PaymentRepository : IPaymentRepository
    {
        private readonly PaymentDbContext _context;

        public PaymentRepository(PaymentDbContext context)
        {
            _context = context;
        }

        public async Task<Transaction> CreateAsync(Transaction transaction)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_ProcessPayment @OrderId = {0}, @UserId = {1}, " +
                "@Amount = {2}, @Status = {3}, @PaymentMethod = {4}",
                transaction.OrderId,
                transaction.UserId,
                transaction.Amount,
                transaction.Status,
                transaction.PaymentMethod);

            // Fetch the saved transaction
            var result = await _context.Transactions
                .FromSqlRaw(
                    "EXEC sp_GetTransactionByOrderId @OrderId = {0}",
                    transaction.OrderId)
                .AsNoTracking()
                .ToListAsync();

            return result.FirstOrDefault() ?? transaction;
        }

        public async Task<Transaction?> GetByOrderIdAsync(int orderId)
        {
            var result = await _context.Transactions
                .FromSqlRaw(
                    "EXEC sp_GetTransactionByOrderId @OrderId = {0}",
                    orderId)
                .AsNoTracking()
                .ToListAsync();

            return result.FirstOrDefault();
        }
        public async Task<List<Transaction>> GetByUserIdAsync(int userId)
{
    return await _context.Transactions
        .FromSqlRaw(
            "EXEC sp_GetTransactionsByUserId @UserId = {0}",
            userId)
        .AsNoTracking()
        .ToListAsync();
}
    }
}