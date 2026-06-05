namespace FarmApi.Models.DTO
{
    public class InvestorProfileDto
    {
        public int InvestorId { get; set; }

        public string Name { get; set; }

        public string MobileNumber { get; set; }

        public string Email { get; set; }

        public int Age { get; set; }

        public string AadhaarNumber { get; set; }

        public string PANNumber { get; set; }

        public string AccountNumber { get; set; }

        public string IFSCCode { get; set; }

        public string AadhaarDocumentUrl { get; set; }

        public string PANDocumentUrl { get; set; }
    }
}
