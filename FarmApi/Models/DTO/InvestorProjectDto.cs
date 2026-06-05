namespace FarmApi.Models.DTO
{
    public class InvestorProjectDto
    {
        public int ProjectInvestorId { get; set; }

        public int ProjectId { get; set; }

        public string ProjectCode { get; set; }

        public string ProjectName { get; set; }

        public string CropKey { get; set; }

        public string CategoryKey { get; set; }

        public int PlantCount { get; set; }

        public decimal AmountInvested { get; set; }

        public DateTime? InvestmentDate { get; set; }

        public string PaymentFrequency { get; set; }

        public int? InstallmentCount { get; set; }

        public decimal? InstallmentAmount { get; set; }

        public string Status { get; set; }

        public decimal? EstimatedYieldKg { get; set; }

        public DateTime? ExpectedHarvestDate { get; set; }
    }
}
