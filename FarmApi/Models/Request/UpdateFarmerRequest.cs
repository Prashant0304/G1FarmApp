namespace FarmApi.Models.Request
{
    public class UpdateFarmerRequest
    {
        public int FarmerId { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public string? Village { get; set; }
        public int? DistrictId { get; set; }
        public int? StateId { get; set; }
        public decimal? LandSize { get; set; }
        public int UpdatedBy { get; set; }
    }
}
