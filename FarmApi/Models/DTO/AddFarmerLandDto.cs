namespace FarmApi.Models.DTO
{
    public class AddFarmerLandDto
    {
        public int FarmerId { get; set; }

        public string? LandLocation { get; set; }

        public int StateId { get; set; }

        public int DistrictId { get; set; }

        public int HobliId { get; set; }

        public string? SoilType { get; set; }

        public string? WaterSource { get; set; }

        public decimal? LandSize { get; set; }

        public int? UomId { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }
    }
}
