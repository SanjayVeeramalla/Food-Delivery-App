using UserService.Models;

namespace UserService.Repositories
{
       public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int userId);
        Task<User> CreateAsync(User user);
        Task<bool> EmailExistsAsync(string email);
        Task<User?> UpdateProfileAsync(int userId, string name,
            string phone, string? address);
    }

}