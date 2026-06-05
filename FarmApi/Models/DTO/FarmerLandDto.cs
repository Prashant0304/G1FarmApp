namespace FarmApi.Models.DTO
{
    public class FarmerLandDto
    {
        public int LandId { get; set; }
        public string? LandLocation { get; set; }
        public string? SoilType { get; set; }
        public string? WaterSource { get; set; }

        public string? StateName { get; set; }
        public string? DistrictName { get; set; }

        public string? HobliName { get; set; }

        public int LandUomId { get; set; }
    }
}
