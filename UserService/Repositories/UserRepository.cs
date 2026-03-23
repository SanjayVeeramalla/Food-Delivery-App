using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;

namespace UserService.Repositories
{
 
    public class UserRepository : IUserRepository
    {
        private readonly UserDbContext _context;

        public UserRepository(UserDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var users = await _context.Users
                .FromSqlRaw(
                    "EXEC sp_GetUserByEmail @Email = {0}", email)
                .AsNoTracking()
                .ToListAsync();
            return users.FirstOrDefault();
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            var users = await _context.Users
                .FromSqlRaw(
                    "EXEC sp_GetUserById @UserId = {0}", userId)
                .AsNoTracking()
                .ToListAsync();
            return users.FirstOrDefault();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            var users = await _context.Users
                .FromSqlRaw(
                    "EXEC sp_GetUserByEmail @Email = {0}", email)
                .AsNoTracking()
                .ToListAsync();
            return users.Any();
        }

        public async Task<User> CreateAsync(User user)
        {
            var result = await _context.Users
                .FromSqlRaw(
                    "EXEC sp_RegisterUser @Name = {0}, @Email = {1}, " +
                    "@PasswordHash = {2}, @Phone = {3}",
                    user.Name,
                    user.Email,
                    user.PasswordHash,
                    user.Phone ?? (object)DBNull.Value)
                .AsNoTracking()
                .ToListAsync();
            return result.FirstOrDefault() ?? user;
        }

        public async Task<User?> UpdateProfileAsync(
            int userId, string name, string phone, string? address)
        {
            var result = await _context.Users
                .FromSqlRaw(
                    "EXEC sp_UpdateUserProfile @UserId = {0}, " +
                    "@Name = {1}, @Phone = {2}, @Address = {3}",
                    userId,
                    name,
                    phone,
                    address ?? (object)DBNull.Value)
                .AsNoTracking()
                .ToListAsync();
            return result.FirstOrDefault();
        }
    }
}