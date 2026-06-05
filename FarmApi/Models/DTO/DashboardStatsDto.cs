namespace FarmApi.Models.DTO
{
    public class DashboardStatsDto
    {
        public int TotalFarmers { get; set; }
        public int TotalHarvests { get; set; }
        public decimal TotalPayment { get; set; }
        public int TotalLands { get; set; }
    }
}

