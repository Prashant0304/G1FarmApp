namespace FarmApi.Models.DTO
{
    public class CreateProjectRequestDto
    {
        public string? ProjectCode { get; set; }

        public int LandId { get; set; }

        public string? ProjectName { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public decimal EstimatedInvestment { get; set; }

        public string? PaymentFrequency { get; set; }

        public int TotalPlants { get; set; }

        public string? Status { get; set; }

        public int CreatedBy { get; set; }
    }
}
