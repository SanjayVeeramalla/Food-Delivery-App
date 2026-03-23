using System.ComponentModel.DataAnnotations;

namespace RestaurantService.DTOs
{
    public class RestaurantDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CuisineType { get; set; }
        public string? Address { get; set; }
        public decimal Rating { get; set; }
    }

    public class MenuItemDto
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public bool IsAvailable { get; set; }
        public string? ImageUrl { get; set; }        // add this
    }

    public class CreateMenuItemDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string? ImageUrl { get; set; }        // add this
    }

    public class CreateRestaurantDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? CuisineType { get; set; }
        public string? Address { get; set; }
        public decimal Rating { get; set; } = 0;
    }
}