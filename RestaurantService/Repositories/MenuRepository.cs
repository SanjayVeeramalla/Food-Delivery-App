using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Repositories
{
    public interface IMenuRepository
    {
        Task<List<MenuItem>> GetByRestaurantIdAsync(int restaurantId);
        Task<MenuItem?> GetByIdAsync(int restaurantId, int menuItemId);
        Task<MenuItem> CreateAsync(MenuItem item);
        Task<bool> UpdateAsync(MenuItem item);
        Task<bool> DeleteAsync(int restaurantId, int menuItemId);
        Task<List<MenuItem>> GetAllByRestaurantIdAsync(int restaurantId);
        Task<bool> MarkUnavailableAsync(int restaurantId, int menuItemId);

    }

    public class MenuRepository : IMenuRepository
    {
        private readonly RestaurantDbContext _context;

        public MenuRepository(RestaurantDbContext context)
        {
            _context = context;
        }

        public async Task<List<MenuItem>> GetByRestaurantIdAsync(int restaurantId)
        {
            return await _context.MenuItems
                .FromSqlRaw(
                    "EXEC sp_GetMenuByRestaurant @RestaurantId = {0}",
                    restaurantId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MenuItem?> GetByIdAsync(int restaurantId, int menuItemId)
        {
            var result = await _context.MenuItems
                .FromSqlRaw(
                    "EXEC sp_GetMenuItemById @RestaurantId = {0}, @MenuItemId = {1}",
                    restaurantId, menuItemId)
                .AsNoTracking()
                .ToListAsync();

            return result.FirstOrDefault();
        }

        public async Task<MenuItem> CreateAsync(MenuItem item)
        {
            var result = await _context.MenuItems
                .FromSqlRaw(
                    "EXEC sp_AddMenuItem @RestaurantId = {0}, @Name = {1}, " +
                    "@Description = {2}, @Price = {3}, @Category = {4}, " +
                    "@IsAvailable = {5}, @ImageUrl = {6}",
                    item.RestaurantId,
                    item.Name,
                    item.Description ?? (object)DBNull.Value,
                    item.Price,
                    item.Category    ?? (object)DBNull.Value,
                    item.IsAvailable,
                    item.ImageUrl    ?? (object)DBNull.Value)
                .AsNoTracking()
                .ToListAsync();

            return result.FirstOrDefault() ?? item;
        }

        public async Task<bool> UpdateAsync(MenuItem item)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_UpdateMenuItem @MenuItemId = {0}, @Name = {1}, " +
                "@Description = {2}, @Price = {3}, @Category = {4}, " +
                "@IsAvailable = {5}, @ImageUrl = {6}",
                item.Id,
                item.Name,
                item.Description ?? (object)DBNull.Value,
                item.Price,
                item.Category    ?? (object)DBNull.Value,
                item.IsAvailable,
                item.ImageUrl    ?? (object)DBNull.Value);

            return true;
        }

        public async Task<bool> MarkUnavailableAsync(int restaurantId, int menuItemId)
{
    var rows = await _context.Database.ExecuteSqlRawAsync(
        "EXEC sp_MarkMenuItemUnavailable @RestaurantId = {0}, @MenuItemId = {1}",
        restaurantId, menuItemId);

    return rows > 0;
}

public async Task<bool> DeleteAsync(int restaurantId, int menuItemId)
{
    var rows = await _context.Database.ExecuteSqlRawAsync(
        "EXEC sp_DeleteMenuItem @RestaurantId = {0}, @MenuItemId = {1}",
        restaurantId, menuItemId);

    return rows > 0;
}

        public async Task<List<MenuItem>> GetAllByRestaurantIdAsync(
    int restaurantId)
{
    return await _context.MenuItems
        .FromSqlRaw(
            "EXEC sp_GetAllMenuByRestaurant @RestaurantId = {0}",
            restaurantId)
        .AsNoTracking()
        .ToListAsync();
}

    }
}