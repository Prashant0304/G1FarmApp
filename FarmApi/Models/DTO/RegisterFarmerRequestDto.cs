namespace FarmerApp.DTOs
{
    public class RegisterFarmerRequestDto
    {
        public string Name { get; set; }

        public string PhoneNumber { get; set; }

        public string Village { get; set; }

        public int StateId { get; set; }

        public int DistrictId { get; set; }
        public int HobliId { get; set; }
    }

    public class RegisterFarmerResponseDto
    {
        public int? FarmerId { get; set; }

        public string Status { get; set; }
    }

}
