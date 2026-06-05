namespace FarmerApp.DTOs
{
    public class SendOtpRequestDto
    {
        public string PhoneNumber { get; set; }
    }

    public class SendOtpResponseDto
    {
        public string Status { get; set; }
        public string OTP { get; set; } 
    }

}
