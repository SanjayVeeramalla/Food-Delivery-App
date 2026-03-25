using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantService.DTOs;
using RestaurantService.Services;

namespace RestaurantService.Controllers
{
    [ApiController]
    [Route("api/restaurants/{restaurantId}/menu")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;
        private readonly ILogger<MenuController> _logger;

        public MenuController(IMenuService menuService,
            ILogger<MenuController> logger)
        {
            _menuService = menuService;
            _logger      = logger;
        }

        // GET — available to all logged in users
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetMenu(int restaurantId)
        {
            _logger.LogInformation(
                "Fetching menu for restaurant {Id}", restaurantId);
            var menu = await _menuService
                .GetMenuByRestaurantAsync(restaurantId);
            if (menu == null || menu.Count == 0)
                return NotFound(
                    new { message = "No menu items found." });
            return Ok(menu);
        }

        [HttpGet("{menuItemId}")]
        [Authorize]
        public async Task<IActionResult> GetMenuItem(
            int restaurantId, int menuItemId)
        {
            var item = await _menuService
                .GetMenuItemByIdAsync(restaurantId, menuItemId);
            if (item == null)
                return NotFound(
                    new { message = "Menu item not found." });
            return Ok(item);
        }

        // POST, PUT, DELETE — Admin only
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddMenuItem(
            int restaurantId,
            [FromBody] CreateMenuItemDto dto)
        {
            _logger.LogInformation(
                "Admin adding menu item to restaurant {Id}",
                restaurantId);
            var item = await _menuService
                .AddMenuItemAsync(restaurantId, dto);
            return StatusCode(201, item);
        }

        [HttpPut("{menuItemId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMenuItem(
            int restaurantId,
            int menuItemId,
            [FromBody] CreateMenuItemDto dto)
        {
            var updated = await _menuService
                .UpdateMenuItemAsync(restaurantId, menuItemId, dto);
            if (!updated)
                return NotFound(
                    new { message = "Menu item not found." });
            return Ok(new { message = "Updated successfully." });
        }

        [HttpDelete("{menuItemId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMenuItem(
            int restaurantId, int menuItemId)
        {
            var deleted = await _menuService
                .DeleteMenuItemAsync(restaurantId, menuItemId);
            if (!deleted)
                return NotFound(
                    new { message = "Menu item not found." });
            return Ok(new { message = "Removed successfully." });
        }
        
[HttpGet("all")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetAllMenu(int restaurantId)
{
    _logger.LogInformation(
        "Admin fetching all menu items for restaurant {Id}",
        restaurantId);

    var menu = await _menuService
        .GetAllMenuByRestaurantAsync(restaurantId);

    return Ok(menu);
}
    }
}