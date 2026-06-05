namespace FarmApi.Models.Request
{
    public class ContractRequest
    {

        public int ContractId { get; set; }  // 0 = INSERT, >0 = UPDATE
        public int FarmerId { get; set; }
        public int CropId { get; set; }
        public int LandId { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public decimal Rate { get; set; }
        public decimal Yield { get; set; }

        public int UserId { get; set; }

    }
}
