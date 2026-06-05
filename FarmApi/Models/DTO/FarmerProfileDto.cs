namespace FarmApi.Models.DTO
{
    public class FarmerProfileDto
    {
        public int FarmerId { get; set; }

        public string Name { get; set; }

        public string PhoneNumber { get; set; }

        public string Village { get; set; }

        public bool IsVerified { get; set; }

        public decimal? LandSize { get; set; }

        public string UOMName { get; set; }

        public string DistrictName { get; set; }

        public string StateName { get; set; }
    }
}
