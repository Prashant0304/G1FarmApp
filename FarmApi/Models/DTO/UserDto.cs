namespace FarmApi.Models.DTO
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public int? RoleId { get; set; }
        public int? FarmerId { get; set; }
    }
}
