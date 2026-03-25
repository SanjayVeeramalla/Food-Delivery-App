using RestaurantService.DTOs;
using RestaurantService.Models;
using RestaurantService.Repositories;

namespace RestaurantService.Services
{
    public interface IMenuService
    {
        Task<List<MenuItemDto>> GetMenuByRestaurantAsync(int restaurantId);
        Task<MenuItemDto?> GetMenuItemByIdAsync(int restaurantId, int menuItemId);
        Task<MenuItemDto> AddMenuItemAsync(int restaurantId, CreateMenuItemDto dto);
        Task<bool> UpdateMenuItemAsync(int restaurantId, int menuItemId, CreateMenuItemDto dto);
        Task<bool> DeleteMenuItemAsync(int restaurantId, int menuItemId);
        Task<List<MenuItemDto>> GetAllMenuByRestaurantAsync(int restaurantId);
    }

    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _menuRepo;
        private readonly ILogger<MenuService> _logger;

        public MenuService(IMenuRepository menuRepo, ILogger<MenuService> logger)
        {
            _menuRepo = menuRepo;
            _logger   = logger;
        }

        public async Task<List<MenuItemDto>> GetMenuByRestaurantAsync(int restaurantId)
        {
            var items = await _menuRepo.GetByRestaurantIdAsync(restaurantId);
            return items.Select(m => MapToDto(m)).ToList();
        }

        public async Task<MenuItemDto?> GetMenuItemByIdAsync(int restaurantId, int menuItemId)
        {
            var item = await _menuRepo.GetByIdAsync(restaurantId, menuItemId);
            if (item == null) return null;
            return MapToDto(item);
        }

        public async Task<MenuItemDto> AddMenuItemAsync(int restaurantId, CreateMenuItemDto dto)
        {
            var item = new MenuItem
            {
                RestaurantId = restaurantId,
                Name         = dto.Name,
                Description  = dto.Description,
                Price        = dto.Price,
                Category     = dto.Category,
                IsAvailable  = dto.IsAvailable,
                ImageUrl     = dto.ImageUrl        // add this
            };

            var created = await _menuRepo.CreateAsync(item);

            _logger.LogInformation(
                "Menu item {ItemName} added to restaurant {RestaurantId}",
                dto.Name, restaurantId);

            return MapToDto(created);
        }

        public async Task<bool> UpdateMenuItemAsync(
            int restaurantId, int menuItemId, CreateMenuItemDto dto)
        {
            var existing = await _menuRepo.GetByIdAsync(restaurantId, menuItemId);
            if (existing == null) return false;

            existing.Name        = dto.Name;
            existing.Description = dto.Description;
            existing.Price       = dto.Price;
            existing.Category    = dto.Category;
            existing.IsAvailable = dto.IsAvailable;
            existing.ImageUrl    = dto.ImageUrl;   // add this

            return await _menuRepo.UpdateAsync(existing);
        }

        public async Task<bool> DeleteMenuItemAsync(int restaurantId, int menuItemId)
        {
            return await _menuRepo.DeleteAsync(restaurantId, menuItemId);
        }

        // Single mapping method — no repetition
        private static MenuItemDto MapToDto(MenuItem m)
        {
            return new MenuItemDto
            {
                Id           = m.Id,
                RestaurantId = m.RestaurantId,
                Name         = m.Name,
                Description  = m.Description,
                Price        = m.Price,
                Category     = m.Category,
                IsAvailable  = m.IsAvailable,
                ImageUrl     = m.ImageUrl          // add this
            };
        }
        public async Task<List<MenuItemDto>> GetAllMenuByRestaurantAsync(
    int restaurantId)
{
    // Returns ALL items — used by admin only
    var items = await _menuRepo
        .GetAllByRestaurantIdAsync(restaurantId);
    return items.Select(m => MapToDto(m)).ToList();
}
    }
}