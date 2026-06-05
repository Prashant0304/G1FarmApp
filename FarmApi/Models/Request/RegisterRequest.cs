namespace FarmApi.Models.Request
{
    public class RegisterRequest
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Password { get; set; }
        public int? RoleId { get; set; }
        
    }
}
