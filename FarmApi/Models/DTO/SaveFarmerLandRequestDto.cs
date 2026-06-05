namespace FarmerApp.DTOs
{
    public class SaveFarmerLandRequestDto
    {
        public int FarmerId { get; set; }
        public string LandLocation { get; set; }
        public string SoilType { get; set; }
        public string WaterSource { get; set; }
        public decimal? LandSize { get; set; }
        public int LandUOMId { get; set; }

        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}
