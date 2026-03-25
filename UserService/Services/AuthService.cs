using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserService.DTOs;
using UserService.Models;
using UserService.Repositories;

namespace UserService.Services
{


    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository userRepo, IConfiguration config)
        {
            _userRepo = userRepo;
            _config = config;
        }

        public async Task<bool> RegisterAsync(RegisterDto dto)
        {
            if (await _userRepo.EmailExistsAsync(dto.Email))
                return false;

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone
            };

            await _userRepo.CreateAsync(user);
            return true;
        }

        public async Task<string?> LoginAsync(LoginDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            if (user == null) return null;

            bool isValid = BCrypt.Net.BCrypt.Verify(
                dto.Password, user.PasswordHash);
            if (!isValid) return null;

            return GenerateToken(user);
        }

        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Address = user.Address,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<UserProfileDto?> UpdateProfileAsync(
            int userId, UpdateProfileDto dto)
        {
            var updated = await _userRepo.UpdateProfileAsync(
                userId, dto.Name, dto.Phone, dto.Address);

            if (updated == null) return null;

            return new UserProfileDto
            {
                Id = updated.Id,
                Name = updated.Name,
                Email = updated.Email,
                Phone = updated.Phone,
                Address = updated.Address,
                CreatedAt = updated.CreatedAt
            };
        }

        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.Name),
        new Claim(ClaimTypes.Role, user.Role)
    };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
       public async Task<UserProfileDto?> GetByIdAsync(int id)
{
    // Repository returns User model
    // Service maps it to UserProfileDto
    var user = await _userRepo.GetByIdAsync(id);
    if (user == null) return null;

    return new UserProfileDto
    {
        Id        = user.Id,
        Name      = user.Name,
        Email     = user.Email,
        Phone     = user.Phone,
        Address   = user.Address,
        Role      = user.Role,
        CreatedAt = user.CreatedAt
    };
}
    }
}