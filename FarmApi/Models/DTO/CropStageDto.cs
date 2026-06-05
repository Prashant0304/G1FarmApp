namespace FarmApi.Models.DTO
{
    public class CropStageDto
    {
        public int StageId { get; set; }
        public int CropId { get; set; }
        public string StageKey { get; set; }
        public int DayFrom { get; set; }
        public int DayTo { get; set; }
    }
}
