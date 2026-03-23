namespace RestaurantService.Models
{
    public class Restaurant
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CuisineType { get; set; }
        public string? Address { get; set; }
        public decimal Rating { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } 
        public List<MenuItem> MenuItems { get; set; } = new();
    }


}