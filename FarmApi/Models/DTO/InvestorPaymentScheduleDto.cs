namespace FarmApi.Models.DTO
{
    public class InvestorPaymentScheduleDto
    {
        public string ProjectName { get; set; }

        public string CropName { get; set; }

        public string FrequencyName { get; set; }

        public decimal InstallmentAmount { get; set; }

        public decimal PaidAmount { get; set; }

        public decimal RemainingAmount { get; set; }

        public decimal TotalPaid { get; set; }

        public string Status { get; set; }
    }
}
