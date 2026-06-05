using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HarvestController : ControllerBase
    {
        private readonly DbService _db;

        public HarvestController(DbService db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] dynamic model)
        {
            await _db.ExecuteAsync("AddHarvest", model);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> Get(int contractId, int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetHarvests",
                new { ContractId = contractId, PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }
    }
}
