using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantService.DTOs;
using RestaurantService.Services;

namespace RestaurantService.Controllers
{
    [ApiController]
    [Route("api/restaurants")]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _service;
        private readonly ILogger<RestaurantController> _logger;

        public RestaurantController(IRestaurantService service,
            ILogger<RestaurantController> logger)
        {
            _service = service;
            _logger  = logger;
        }

        // GET — available to all logged in users
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var restaurants = await _service.GetAllActiveAsync();
            return Ok(restaurants);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var restaurant = await _service.GetByIdAsync(id);
            if (restaurant == null)
                return NotFound(new { message = "Restaurant not found." });
            return Ok(restaurant);
        }

        [HttpGet("search")]
        [Authorize]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            var results = await _service.SearchAsync(q);
            return Ok(results);
        }

        // POST — Admin only
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddRestaurant(
            [FromBody] CreateRestaurantDto dto)
        {
            _logger.LogInformation(
                "Admin adding restaurant: {Name}", dto.Name);
            var restaurant = await _service.AddRestaurantAsync(dto);
            return StatusCode(201, restaurant);
        }
    }
}