namespace FarmApi.Models.DTO
{
    public class UpdateInvestorDocumentsDto
    {
        public int InvestorId { get; set; }

        public IFormFile AadhaarDocument { get; set; }

        public IFormFile PANDocument { get; set; }
    }
}
