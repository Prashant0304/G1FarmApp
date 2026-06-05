namespace FarmApi.Models.DTO
{
    public class RegisterInvestorRequestDto
    {
        public string? Name { get; set; }

        public string? MobileNumber { get; set; }

        public string? Email { get; set; }

        public int? Age { get; set; }

        public string? AadhaarNumber { get; set; }

        public string? PANNumber { get; set; }

        public string? AccountNumber { get; set; }

        public string? IFSCCode { get; set; }

        public int? CreatedBy { get; set; }

        public IFormFile? AadhaarDocument { get; set; }

        public IFormFile? PANDocument { get; set; }
    }
}
