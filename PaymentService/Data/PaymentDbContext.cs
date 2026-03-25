using Microsoft.EntityFrameworkCore;
using PaymentService.Models;

namespace PaymentService.Data
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(
            DbContextOptions<PaymentDbContext> options)
            : base(options) { }

        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            // Prevent decimal truncation warning
            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(10, 2);
        }
    }
}
