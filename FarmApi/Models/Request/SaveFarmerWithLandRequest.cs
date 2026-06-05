namespace FarmApi.Models.Request
{
    public class SaveFarmerWithLandRequest
    {
        public int FarmerId { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Village { get; set; }
        public string District { get; set; }
        public string State { get; set; }
        public decimal LandSize { get; set; }

        public int LandId { get; set; }
        public string Location { get; set; }
        public string SoilType { get; set; }
        public string WaterSource { get; set; }

        public int UserId { get; set; }
    }
}
