namespace FarmerApp.DTOs
{
    public class FarmerDashboardDto
{
    public int FarmerId { get; set; }
    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Village { get; set; }
    public int? DistrictId { get; set; }
    public int? StateId { get; set; }
    public decimal? LandSize { get; set; }
    public bool? IsVerified { get; set; }

    public List<LandDto> Lands { get; set; } = new();
}

public class LandDto
{
    public int ? LandId { get; set; }
    public string? LandLocation { get; set; }
    public string? SoilType { get; set; }
    public string? WaterSource { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}

    public class TempFarmerLandResult
    {
        public int FarmerId { get; set; }
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Village { get; set; }
        public int? DistrictId { get; set; }
        public int? StateId { get; set; }
        public decimal? LandSize { get; set; }
        public bool? IsVerified { get; set; }

        public int? LandId { get; set; }
        public string? LandLocation { get; set; }
        public string? SoilType { get; set; }
        public string? WaterSource { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}
