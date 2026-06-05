using FarmApi.Models.DTO;
using FarmApi.Models.Request;
using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CropController : ControllerBase
    {
        private readonly DbService _db;
        private readonly FarmDbContext dbContext;

        public CropController(DbService db, FarmDbContext dbContext)
        {
            _db = db;
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> Get(string lang = "2", string search = "", int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetCrops",
                new { LanguageCode = lang, Search = search, PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }

        [HttpGet("get-crop-stages")]

        public async Task<IActionResult> GetCropStages(int cropId)
        {
            var result = await _db.QueryAsync<CropStageDto>(
                "GetCropStageByCropId",
                new { CropId = cropId }
            );

            return Ok(new
            {
                data = result
            });
        }

        [HttpPost("Delete-crop-stage")]
        public async Task<IActionResult> DeleteCropStageByCropId(int stageId)
        {
            var deletedStageId = await _db.QuerySingleAsync<int>(
        "DeleteCropStageByCropId",
        new { StageId = stageId }
    );

            return Ok(new
            {
                success = true,
                stageId = deletedStageId
            });
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] dynamic model)
        {
            await _db.ExecuteAsync("SaveCrop", model);
            return Ok();
        }

        [HttpPost("save-crop-with-stage")]
        public async Task<IActionResult> SaveCropWithStage([FromBody] SaveCropWithStageRequest request)
        {
            try
            {
                int cropId = 0;

                using (var conn = dbContext.Database.GetDbConnection())
                {
                    await conn.OpenAsync();

                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "SaveCropWithStage";
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.Add(new SqlParameter("@CropId", request.CropId));
                        cmd.Parameters.Add(new SqlParameter("@CropKey", (object?)request.CropKey ?? DBNull.Value));
                        cmd.Parameters.Add(new SqlParameter("@CategoryKey", (object?)request.CategoryKey ?? DBNull.Value));
                        cmd.Parameters.Add(new SqlParameter("@GrowthDurationDays", (object?)request.GrowthDurationDays ?? DBNull.Value));
                        cmd.Parameters.Add(new SqlParameter("@DefaultUomId", (object?)request.DefaultUomId ?? DBNull.Value));

                        cmd.Parameters.Add(new SqlParameter("@StageKey", (object?)request.StageKey ?? DBNull.Value));
                        cmd.Parameters.Add(new SqlParameter("@DayFrom", (object?)request.DayFrom ?? DBNull.Value));
                        cmd.Parameters.Add(new SqlParameter("@DayTo", (object?)request.DayTo ?? DBNull.Value));

                        cmd.Parameters.Add(new SqlParameter("@CreatedBy", request.CreatedBy));

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                cropId = reader.GetInt32(0);
                            }
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "Saved successfully",
                    data = new { CropId = cropId }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
