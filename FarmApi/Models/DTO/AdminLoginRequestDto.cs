namespace FarmApi.Models.DTO
{
    public class AdminLoginRequestDto
    {
        public string MobileNumber { get; set; }

        public string Password { get; set; }
    }

    public class AdminLoginResponseDto
    {
        public int UserId { get; set; }

        public string Name { get; set; }

        public string Phone { get; set; }


        public int RoleId { get; set; }

    }
}
