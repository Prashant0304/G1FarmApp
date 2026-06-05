using FarmApi.Models.DTO;
using FarmApi.Services;
using FarmerApp.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly DbService _db;
        private readonly FarmerAppDbContext _dbContext;
        private readonly ILogger<MasterController> _logger;

        public DashboardController(DbService db, FarmerAppDbContext dbContext, ILogger<MasterController> logger) { 
                _db = db;
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpGet("get-dashboard/{farmerId}")]
        public async Task<IActionResult> GetFarmerDashboard(int farmerId)
        {
            try
            {
                var result = await _dbContext
                 .Set<TempFarmerLandResult>() // 👈 temp mapping
                 .FromSqlRaw("EXEC GetFarmerDashboardData @FarmerId",
                     new SqlParameter("@FarmerId", farmerId))
                 .ToListAsync();

                if (result == null || result.Count == 0)
                    return NotFound();

                // ✅ Map to clean DTO
                var farmer = new FarmerDashboardDto
                {
                    FarmerId = result[0].FarmerId,
                    Name = result[0].Name,
                    PhoneNumber = result[0].PhoneNumber,
                    Village = result[0].Village,
                    DistrictId = result[0].DistrictId,
                    StateId = result[0].StateId,
                    LandSize = result[0].LandSize,
                    IsVerified = result[0].IsVerified,
                    Lands = result.Select(x => new LandDto
                    {
                        LandId = x.LandId,
                        LandLocation = x.LandLocation,
                        SoilType = x.SoilType,
                        WaterSource = x.WaterSource,
                        Latitude = x.Latitude,
                        Longitude = x.Longitude
                    }).ToList()
                };

                return Ok(farmer);
            }catch(Exception ex)
            {
                return NotFound();
            }
        }

        [HttpGet("get-profile/{farmerId}")]
        public async Task<IActionResult> GetProfile(int farmerId)
        {
            try
            {
                var farmer = _dbContext
     .Set<FarmerProfileDto>()
     .FromSqlRaw(
         "EXEC GetFarmerProfile @FarmerId",
         new SqlParameter("@FarmerId", farmerId))
     .AsEnumerable()
     .FirstOrDefault();

                if (farmer == null)
                    return NotFound();

                return Ok(farmer);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var result = await _db.QuerySingleAsync<DashboardStatsDto>(
                "GetDashboardStats"
            );

            return Ok(result);
        }



        [HttpGet("getlandsbyfarmerId/{farmerId}")]
        public async Task<IActionResult> GetLandsByFarmerId(int farmerId)
        {
            try
            {
                var landinfo = await _dbContext
                    .Set<FarmerLandDto>()
                    .FromSqlRaw(
                        "EXEC GetFarmerLandsByFarmerId @FarmerId",
                        new SqlParameter("@FarmerId", farmerId)
                    )
                    .ToListAsync();

                if (landinfo == null || !landinfo.Any())
                    return NotFound();

                return Ok(landinfo);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("crop-distribution")]
        public async Task<IActionResult> GetCropDistribution(string languageCode)
        {
            var result = await _db.QueryAsync<dynamic>(
                "GetCropDistribution",
                new { LanguageCode = languageCode }
            );

            return Ok(new
            {
                data = result
            });
        }
    }
}
