namespace FarmApi.Models.DTO
{
    public class ChangeInvestorPasswordDto
    {
        public int InvestorId { get; set; }

        public string OldPassword { get; set; }

        public string NewPassword { get; set; }
    }
}
