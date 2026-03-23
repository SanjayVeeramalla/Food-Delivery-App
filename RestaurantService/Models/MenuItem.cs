namespace RestaurantService.Models
{
    public class MenuItem
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Category { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string? ImageUrl { get; set; }        // add this
        public Restaurant? Restaurant { get; set; }
    }
}