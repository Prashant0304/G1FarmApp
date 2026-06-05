namespace FarmerApp.DTOs
{
    public class VerifyOtpRequestDto
    {
        public string PhoneNumber { get; set; }
        public string OTP { get; set; }
    }
    public class VerifyOtpResponseDto
    {
        public string Status { get; set; }
        public int Result { get; set; }
    }
}
