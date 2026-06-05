namespace FarmApi.Models.DTO
{
    public class AddProjectInvestorRequestDto
    {
        public int InvestorId { get; set; }

        public int ProjectCropId { get; set; }

        public int PlantCount { get; set; }

        public decimal AmountInvested { get; set; }

        public DateTime InvestmentDate { get; set; }

        public string? PaymentFrequency { get; set; }

        public int InstallmentCount { get; set; }

        public decimal InstallmentAmount { get; set; }

        public string? Status { get; set; }
    }
}
