namespace FarmApi.Models.Request
{
    public class SaveCropWithStageRequest
    {
        public int CropId { get; set; } = 0;

        // Crop fields
        public string? CropKey { get; set; }
        public string? CategoryKey { get; set; }
        public int? GrowthDurationDays { get; set; }

        public int? DefaultUomId { get; set; }

        // Stage fields
        public string? StageKey { get; set; }
        public int? DayFrom { get; set; }
        public int? DayTo { get; set; }

        public int CreatedBy { get; set; }
    }
}
