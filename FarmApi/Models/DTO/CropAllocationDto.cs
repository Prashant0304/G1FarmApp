namespace FarmApi.Models.DTO
{
    public class CropAllocationDto
    {
        public string CategoryKey { get; set; }

        public decimal Amount { get; set; }

        public decimal Percentage { get; set; }
    }
}
