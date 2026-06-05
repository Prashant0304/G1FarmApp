namespace FarmerApp.DTOs
{
    public class ResendOtpRequestDto
    {
        public string PhoneNumber { get; set; }
    }
    public class ResendOtpResponseDto
    {
        public string OTP { get; set; }
        public string Status { get; set; }
    }
}
