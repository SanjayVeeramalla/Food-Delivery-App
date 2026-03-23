using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Repositories
{
    public interface IRestaurantRepository
    {
        Task<List<Restaurant>> GetAllActiveAsync();
        Task<Restaurant?> GetByIdAsync(int id);
        Task<List<Restaurant>> SearchAsync(string term);
        Task<Restaurant> CreateAsync(Restaurant restaurant);
    }

    public class RestaurantRepository : IRestaurantRepository
    {
        private readonly RestaurantDbContext _context;

        public RestaurantRepository(RestaurantDbContext context)
        {
            _context = context;
        }

        public async Task<List<Restaurant>> GetAllActiveAsync()
        {
            return await _context.Restaurants
                .FromSqlRaw("EXEC sp_GetActiveRestaurants")
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Restaurant?> GetByIdAsync(int id)
        {
            var result = await _context.Restaurants
                .FromSqlRaw(
                    "EXEC sp_GetRestaurantById @RestaurantId = {0}", id)
                .AsNoTracking()
                .ToListAsync();

            return result.FirstOrDefault();
        }

        public async Task<List<Restaurant>> SearchAsync(string term)
        {
            return await _context.Restaurants
                .FromSqlRaw(
                    "EXEC sp_SearchRestaurants @SearchTerm = {0}", term)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Restaurant> CreateAsync(Restaurant restaurant)
        {
            var result = await _context.Restaurants
                .FromSqlRaw(
                    "EXEC sp_AddRestaurant @Name = {0}, @CuisineType = {1}, " +
                    "@Address = {2}, @Rating = {3}",
                    restaurant.Name,
                    restaurant.CuisineType ?? (object)DBNull.Value,
                    restaurant.Address     ?? (object)DBNull.Value,
                    restaurant.Rating)
                .AsNoTracking()
                .ToListAsync();

            return result.FirstOrDefault() ?? restaurant;
        }
    }
}