using FarmApi.Models.DTO;
using FarmApi.Models.Request;
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
    public class FarmerController : ControllerBase
    {
        private readonly DbService _db;
        private readonly FarmerAppDbContext _dbContext;
        private readonly ILogger<MasterController> _logger;

        public FarmerController(DbService db, FarmerAppDbContext farmerAppDbContext, ILogger<MasterController> logger)
        {
            _db = db;
            _dbContext = farmerAppDbContext;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterFarmerRequestDto farmer)
        {
            try
            {
                var result = await _dbContext
                    .Set<RegisterFarmerResponseDto>()
                    .FromSqlRaw(
                        "EXEC RegisterFarmer @Name, @PhoneNumber, @Village, @StateId, @DistrictId,@HobliId",
                        new SqlParameter("@Name", farmer.Name),
                        new SqlParameter("@PhoneNumber", farmer.PhoneNumber),
                        new SqlParameter("@Village", farmer.Village),
                        new SqlParameter("@StateId", farmer.StateId),
                        new SqlParameter("@DistrictId", farmer.DistrictId),
                        new SqlParameter("@HobliId", farmer.HobliId)
                    )
                    .ToListAsync();

                var response = result.FirstOrDefault();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering farmer");
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPost("get-by-phone")]
        public async Task<IActionResult> CheckUser(
    [FromBody] LoginRequestDto request)  
        {
            if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                return BadRequest("Phone number is required");
            }

            try
            {
                var result = await _dbContext.CheckUserResponses
                .FromSqlRaw(
                    "EXEC loginValidation @PhoneNumber",
                    new SqlParameter(
                        "@PhoneNumber",
                        request.PhoneNumber
                    )
                )
                .ToListAsync();
                  
                var user = result.FirstOrDefault();

                if (user?.ExistsFlag == false)
                {
                    return Ok(new
                    {
                        exists = false
                    });
                }

                return Ok(new
                {
                    exists = user.ExistsFlag,
                    farmerId = user.FarmerId,
                    name = user.Name,
                    phoneNumber = user.PhoneNumber,
                    isVerified = user.IsVerified
                });
            }catch(Exception ex)
            {
                return NotFound(ex);
            }
        }

        [HttpPost("Delete-Land-By-LandId")]
        public async Task<IActionResult> DeleteLand(int landId)
        {
            if (landId <= 0)
                return BadRequest("Invalid Land Id");

            var rowsAffected = await _db.ExecuteAsync(
                "DeleteFarmerLandById",
                new { LandId = landId }
            );

            if (rowsAffected == 0)
                return NotFound("Land not found");

            return Ok(new
            {
                success = true,
                message = "Land deleted successfully"
            });
        }

        [HttpGet("get-lands-by-farmerid")]
        public async Task<IActionResult> GetFarmerLands(int farmerId)
        {
            var data = await _db.QueryAsync<dynamic>(
                "GetFarmerLandsByFarmerId",
                new
                {
                    FarmerId = farmerId
                });

            return Ok(new
            {
                success = true,
                data
            });
        }

        [HttpPost("update-farmer")]
        public async Task<IActionResult> SaveFarmer([FromBody] UpdateFarmerRequest request)
        {
            var data = await _db.QueryAsync<dynamic>(
                "UpdateFarmer",
                new
                {
                    request.FarmerId,
                    request.Name,
                    request.PhoneNumber,
                    request.Village,
                    request.DistrictId,
                    request.StateId,
                    request.LandSize,
                    request.UpdatedBy
                });

            return Ok(new
            {
                success = true,
                message = "Farmer updated successfully",
                data
            });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyFarmer([FromBody] VerifyFarmerRequest request)
        {
            var data = await _db.QueryAsync<dynamic>(
                "VerifyFarmer",
                new
                {
                    FarmerId = request.FarmerId,
                    IsVerified = request.IsVerified,
                    UpdatedBy = 1
                });

            return Ok(new
            {
                success = true,
                message = request.IsVerified
                    ? "Farmer verified successfully"
                    : "Farmer unverified successfully",
                data
            });
        }

        [HttpGet("get-all-farmers")]
        public async Task<IActionResult> Get(
    string? search = null,
    bool? isVerified = null,
    int pageNumber = 1,
    int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetAllFarmers",
                new
                {
                    Search = search,
                    IsVerified = isVerified,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                });

            return Ok(new
            {
                data,
                total
            });
        }

        [HttpPost("insertlanddetails")]
        public async Task<IActionResult> SaveFarmerLand(
    [FromBody] SaveFarmerLandRequestDto dto)
        {
            await _dbContext.Database.ExecuteSqlRawAsync(
                "EXEC SaveFarmerLand @FarmerId, @LandLocation, @SoilType, @WaterSource, @LandSize, @LandUOMId, @Latitude, @Longitude",

                new SqlParameter("@FarmerId", dto.FarmerId),

                new SqlParameter("@LandLocation",
                    dto.LandLocation ?? (object)DBNull.Value),

                new SqlParameter("@SoilType",
                    dto.SoilType ?? (object)DBNull.Value),

                new SqlParameter("@WaterSource",
                    dto.WaterSource ?? (object)DBNull.Value),

                new SqlParameter("@LandSize", dto.LandSize),

                new SqlParameter("@LandUOMId", dto.LandUOMId),

                new SqlParameter("@Latitude", dto.Latitude),

                new SqlParameter("@Longitude", dto.Longitude)
            );

            return Ok(new { status = "SUCCESS" });
        }

        [HttpGet]
        public async Task<IActionResult> Get(int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetFarmers",
                new { PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string search, int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "SearchFarmers",
                new { Search = search, PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] dynamic model)
        {
            await _db.ExecuteAsync("SaveFarmer", model);
            return Ok();
        }

        [HttpGet("by-phone")]
        public async Task<IActionResult> GetByPhone(string phone)
        {
            var result = await _db.QueryAsync<FarmerWithLandDto>(
                "GetFarmerByPhone",
                new { Phone = phone }
            );

            var farmer = result.FirstOrDefault();

            if (farmer == null)
                return NotFound(new { message = "Farmer not found" });

            return Ok(farmer);
        }

        [HttpPost("add-land")]
        public async Task<IActionResult> AddLand(AddFarmerLandDto dto)
        {
            try
            {
                await _dbContext.Database.ExecuteSqlRawAsync(
                    "EXEC AddFarmerLand @FarmerId, @LandLocation, @SoilType, @WaterSource, @LandSize, @UomId, @Latitude, @Longitude, @StateId, @DistrictId, @HobliId",

                    new SqlParameter("@FarmerId", dto.FarmerId),
                    new SqlParameter("@LandLocation", dto.LandLocation),
                    new SqlParameter("@SoilType", dto.SoilType),
                    new SqlParameter("@WaterSource", dto.WaterSource),
                    new SqlParameter("@LandSize", dto.LandSize),
                    new SqlParameter("@UomId", dto.UomId),
                    new SqlParameter("@Latitude", dto.Latitude),
                    new SqlParameter("@Longitude", dto.Longitude),
                    new SqlParameter("@StateId",dto.StateId),
                    new SqlParameter("@DistrictId",dto.DistrictId),
                    new SqlParameter("@HobliId",dto.HobliId)


                );

                return Ok(new
                {
                    message = "Land Added Successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("save-or-update-land")]
        public async Task<IActionResult> SaveLand(
[FromBody] SaveOrUpdateFarmerLandRequest request)
        {
            var data = await _db.QueryAsync<dynamic>(
                "SaveOrUpdateFarmerLand",
                new
                {
                    request.LandId,
                    request.FarmerId,
                    request.LandLocation,
                    request.SoilType,
                    request.WaterSource,
                    request.LandUom,
                    request.Latitude,
                    request.Longitude,
                    request.CreatedBy,
                    request.UpdatedBy
                });

            return Ok(new
            {
                success = true,
                message = request.LandId > 0
                    ? "Land updated successfully"
                    : "Land added successfully",
                data
            });
        }

        [HttpPost("save-with-land")]
        public async Task<IActionResult> SaveWithLand([FromBody] SaveFarmerWithLandRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Phone))
                return BadRequest(new { message = "Phone is required" });

            var result = await _db.QueryAsync<dynamic>(
                "SaveFarmerWithLand",
                new
                {
                    req.FarmerId,
                    req.Name,
                    req.Phone,
                    req.Village,
                    req.District,
                    req.State,
                    req.LandSize,

                    req.LandId,
                    Location = req.Location,
                    req.SoilType,
                    req.WaterSource,

                    UserId = req.UserId
                }
            );

            var farmerId = result.FirstOrDefault()?.FarmerId;

            return Ok(new
            {
                message = "Saved successfully",
                farmerId = farmerId
            });
        }
    }
}
