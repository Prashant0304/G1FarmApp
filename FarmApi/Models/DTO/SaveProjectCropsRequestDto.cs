namespace FarmApi.Models.DTO
{
    public class SaveProjectCropsRequestDto
    {
        public int ProjectId { get; set; }

        public int CreatedBy { get; set; }

        public List<AddProjectCropRequestDto> Crops { get; set; } = new();
    }
}
