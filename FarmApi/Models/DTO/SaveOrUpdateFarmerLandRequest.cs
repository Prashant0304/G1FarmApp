namespace FarmApi.Models.DTO
{
    public class SaveOrUpdateFarmerLandRequest
    {
        public int LandId { get; set; }
        public int FarmerId { get; set; }

        public string LandLocation { get; set; }
        public string? SoilType { get; set; }
        public string? WaterSource { get; set; }

        public int? LandUom { get; set; }

        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
