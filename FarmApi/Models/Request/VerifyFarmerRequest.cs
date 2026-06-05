namespace FarmApi.Models.Request
{
    public class VerifyFarmerRequest
    {
        public int FarmerId { get; set; }
        public bool IsVerified { get; set; }
    }
}
