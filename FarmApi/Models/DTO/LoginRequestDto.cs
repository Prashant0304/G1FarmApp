namespace FarmerApp.DTOs
{
    public class LoginRequestDto
    {
        public string PhoneNumber { get; set; }
    }

    public class CheckUserResponseDto
    {
        public int? FarmerId { get; set; }

        public string? Name { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; } = string.Empty;

        public bool ExistsFlag { get; set; }

        public bool? IsVerified { get; set; } = false;
    }
}
