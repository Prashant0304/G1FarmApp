using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InputController : ControllerBase
    {
        private readonly DbService _db;

        public InputController(DbService db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] dynamic model)
        {
            await _db.ExecuteAsync("SaveInput", model);
            return Ok();
        }

        [HttpPost("transaction")]
        public async Task<IActionResult> AddTransaction([FromBody] dynamic model)
        {
            await _db.ExecuteAsync("AddInputTransaction", model);
            return Ok();
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions(int contractId, int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetInputTransactions_Paged",
                new { ContractId = contractId, PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }
    }
}
