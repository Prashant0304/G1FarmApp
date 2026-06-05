using FarmApi.Models.DTO;
using FarmApi.Models.Request;
using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Diagnostics.Contracts;
using System.Numerics;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractController : ControllerBase
    {
        private readonly DbService _db;

        private readonly FarmDbContext dbContext;

        public ContractController(DbService db, FarmDbContext dbContext)
        {
            _db = db;
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> Get(string lang = "en", string search = "", int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetContracts",
                new { LanguageCode = lang, Search = search, PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }

        [HttpGet("get-contract-byid")]
        public async Task<IActionResult> GetContratById(int contractId)
        {
            var data = await _db.QueryAsync<dynamic>(
                "GetContractByContractId",
                new { ContractId = contractId });

            return Ok(data);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveContract([FromBody] ContractRequest request)
        {
            try
            {
                var contractIdParam = new SqlParameter("@ContractId", request.ContractId)
                {
                    SqlDbType = SqlDbType.Int,
                    Direction = ParameterDirection.InputOutput
                };

                await dbContext.Database.ExecuteSqlRawAsync(
                    @"EXEC SaveContract 
                    @ContractId = @ContractId OUTPUT,
                    @FarmerId = @FarmerId,
                    @CropId = @CropId,
                    @LandId = @LandId,
                    @StartDate = @StartDate,
                    @EndDate = @EndDate,
                    @Rate = @Rate,
                    @Yield = @Yield,
                    @UserId = @UserId",
                    contractIdParam,
                    new SqlParameter("@FarmerId", request.FarmerId),
                    new SqlParameter("@CropId", request.CropId),
                    new SqlParameter("@LandId", request.LandId),
                    new SqlParameter("@StartDate", request.StartDate),
                    new SqlParameter("@EndDate", request.EndDate),
                    new SqlParameter("@Rate", request.Rate),
                    new SqlParameter("@Yield", request.Yield),
                    new SqlParameter("@UserId", request.UserId)
                );

                int contractId = (int)contractIdParam.Value;

                // ✅ Direct response (no DTO)
                return Ok(contractId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error saving contract",
                    error = ex.Message
                });
            }
        }

        [HttpGet("get-landid")]

        public async Task<IActionResult> GetLandIdByFarmerId(int farmerId)
        {
            var lands = await _db.QueryAsync<dynamic>(
                 "GetLandsByFarmerId",
                 new { FarmerId = farmerId });

            return Ok(lands);
        }
    }
}
