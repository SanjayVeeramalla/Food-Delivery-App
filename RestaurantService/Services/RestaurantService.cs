using RestaurantService.DTOs;
using RestaurantService.Models;
using RestaurantService.Repositories;

namespace RestaurantService.Services
{
    public interface IRestaurantService
    {
        Task<List<RestaurantDto>> GetAllActiveAsync();
        Task<RestaurantDto?> GetByIdAsync(int id);
        Task<List<RestaurantDto>> SearchAsync(string term);
        Task<RestaurantDto> AddRestaurantAsync(CreateRestaurantDto dto);
    }

    public class RestaurantBusinessService : IRestaurantService
    {
        private readonly IRestaurantRepository _repo;

        public RestaurantBusinessService(IRestaurantRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<RestaurantDto>> GetAllActiveAsync()
        {
            var restaurants = await _repo.GetAllActiveAsync();
            return restaurants.Select(r => MapToDto(r)).ToList();
        }

        public async Task<RestaurantDto?> GetByIdAsync(int id)
        {
            var r = await _repo.GetByIdAsync(id);
            if (r == null) return null;
            return MapToDto(r);
        }

        public async Task<List<RestaurantDto>> SearchAsync(string term)
        {
            var restaurants = await _repo.SearchAsync(term);
            return restaurants.Select(r => MapToDto(r)).ToList();
        }

        public async Task<RestaurantDto> AddRestaurantAsync(CreateRestaurantDto dto)
        {
            var restaurant = new Restaurant
            {
                Name        = dto.Name,
                CuisineType = dto.CuisineType,
                Address     = dto.Address,
                Rating      = dto.Rating,
                IsActive    = true,
                CreatedAt   = DateTime.UtcNow
            };

            var created = await _repo.CreateAsync(restaurant);
            return MapToDto(created);
        }

        private static RestaurantDto MapToDto(Restaurant r)
        {
            return new RestaurantDto
            {
                Id          = r.Id,
                Name        = r.Name,
                CuisineType = r.CuisineType,
                Address     = r.Address,
                Rating      = r.Rating
            };
        }
    }
}