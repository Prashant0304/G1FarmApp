using Dapper;
using FarmApi.Services;
using FarmerApp.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterController : ControllerBase
    {
        private readonly DbService _db;
        private readonly FarmerAppDbContext _dbContext;
        private readonly ILogger<MasterController> _logger;

        public MasterController(DbService db, FarmerAppDbContext dbContext, ILogger<MasterController> logger)
        {
            _db = db;
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpGet("states")]
        public async Task<IActionResult> GetStates()
        {
            try
            {
                var states = await _dbContext.StateViewModels
                    .FromSqlRaw("EXEC GetStates")
                    .ToListAsync();

                return Ok(states);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching states");

                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("districts/{stateId}")]
        public async Task<IActionResult> GetDistricts(int stateId)
        {
            try
            {
                var param = new SqlParameter("@StateId", stateId);

                var districts = await _dbContext.DistrictViewModels
                    .FromSqlRaw("EXEC GetDistrictsByState @StateId", param)
                    .ToListAsync();

                return Ok(districts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching districts");

                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }


        [HttpGet("hobli/{districtId}")]
        public async Task<IActionResult> GetHobli(int districtId)
        {
            try
            {
                var param = new SqlParameter("@DistrictId", districtId);

                var hoblis = await _dbContext.HobliViewModels
                    .FromSqlRaw("EXEC GetHoblisByDistrict @DistrictId", param)
                    .ToListAsync();

                return Ok(hoblis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching hoblis");
                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }
        [HttpGet("land-uom")]
        public async Task<IActionResult> GetLandUOM()
        {
            var result = await _dbContext
                .Set<LandUOMDto>()
                .FromSqlRaw("EXEC GetLandUOM")
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("languages")]
        public async Task<IActionResult> GetLanguages()
        {
            var data = await _db.QueryAsync<dynamic>("GetLanguages");
            return Ok(data);
        }

        [HttpGet("menus")]
        public async Task<IActionResult> GetMenus(int roleId, string languageCode)
        {
            var param = new DynamicParameters();
            param.Add("@RoleId", roleId);
            param.Add("@LanguageCode", languageCode);

            var data = await _db.QueryAsync<dynamic>(
                "dbo.GetMenusByRoleAndLanguage",
                param
            );

            return Ok(data);
        }

        [HttpGet("translations")]
        public async Task<IActionResult> GetTranslations(string lang)
        {
            var data = await _db.QueryAsync<dynamic>("GetTranslations", new { LanguageCode = lang });
            return Ok(data);
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var data = await _db.QueryAsync<dynamic>("GetRoles");
            return Ok(data);
        }
    }
}
