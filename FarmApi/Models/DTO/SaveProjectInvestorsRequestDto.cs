namespace FarmApi.Models.DTO
{
    public class SaveProjectInvestorsRequestDto
    {

        public int ProjectId { get; set; }

        public List<AddProjectInvestorRequestDto> Investors { get; set; } = new();

    }
}
