namespace FarmApi.Models.DTO
{
    public class AddProjectCropRequestDto
    {
        public int CropId { get; set; }

        public int PlantCount { get; set; }

        public decimal CostPerPlant { get; set; }

        public decimal EstimatedYieldKg { get; set; }

        public DateTime ExpectedHarvestDate { get; set; }

        public decimal TotalEstimatedCost { get; set; }
    }
}
