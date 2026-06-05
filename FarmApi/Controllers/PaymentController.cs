using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly DbService _db;

        public PaymentController(DbService db)
        {
            _db = db;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate(int contractId, int userId)
        {
            await _db.ExecuteAsync("GeneratePayment", new { ContractId = contractId, UserId = userId });
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> Get(int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetPayments",
                new { PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }
    }
}
