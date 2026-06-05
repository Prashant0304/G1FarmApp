namespace FarmApi.Models.DTO
{
    public class UpdateInvestorProfileDto
    {
        public int InvestorId { get; set; }

        public string Name { get; set; }

        public string MobileNumber { get; set; }

        public string Email { get; set; }

        public int Age { get; set; }

        public string AccountNumber { get; set; }

        public string IFSCCode { get; set; }
    }
}
