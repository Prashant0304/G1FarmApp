namespace FarmApi.Models.DTO
{
    public class InvestorLoginResponseDto
    {
        public int InvestorId { get; set; }

        public string? Name { get; set; } = string.Empty;

        public string MobileNumber { get; set; } = string.Empty;

        public string? Email { get; set; } = string.Empty;
    }
}
