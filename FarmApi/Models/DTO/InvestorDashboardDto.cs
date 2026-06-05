namespace FarmApi.Models.DTO
{
    public class InvestorDashboardDto
    {
        public int InvestorId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public string MobileNumber { get; set; }

        public decimal TotalInvested { get; set; }

        public int ActiveProjects { get; set; }

        public int CompletedProjects { get; set; }

        public int TotalInstallments { get; set; }
    }


    public class InvestorInvestmentDto
    {
        public int ProjectInvestorId { get; set; }

        public int ProjectId { get; set; }

        public string ProjectCode { get; set; }

        public string ProjectName { get; set; }

        public string LandLocation { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public decimal? EstimatedInvestment { get; set; }

        public string? PaymentFrequency { get; set; }

        public int? TotalPlants { get; set; }

        public string ProjectStatus { get; set; }

        public string CropKey { get; set; }

        public string CategoryKey { get; set; }

        public int? ProjectCropId { get; set; }

        public int? InvestorPlantCount { get; set; }

        public decimal? AmountInvested { get; set; }

        public DateTime? InvestmentDate { get; set; }

        public int? InstallmentCount { get; set; }

        public decimal? InstallmentAmount { get; set; }

        public decimal? EstimatedYieldKg { get; set; }

        public DateTime? ExpectedHarvestDate { get; set; }

        public decimal? TotalEstimatedCost { get; set; }

        public decimal? CostPerPlant { get; set; }



    }
}
