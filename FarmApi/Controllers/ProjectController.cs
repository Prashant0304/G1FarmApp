using FarmApi.Models.DTO;
using FarmApi.Models.Response;
using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly DbService _db;
        private readonly FarmerAppDbContext _dbContext;
        private readonly ILogger<ProjectController> _logger;

        public ProjectController(DbService db, FarmerAppDbContext dbContext, ILogger<ProjectController> logger)
        {
            _db = db;
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateProject(
            [FromBody] CreateProjectRequestDto request)
        {
            try
            {
                var result = await _dbContext
                    .Set<ProjectResponse>()
                    .FromSqlRaw(
                        @"EXEC CreateProject
                    @ProjectCode,
                    @LandId,
                    @ProjectName,
                    @StartDate,
                    @EndDate,
                    @EstimatedInvestment,
                    @PaymentFrequency,
                    @TotalPlants,
                    @Status,
                    @CreatedBy",

                        new SqlParameter("@ProjectCode", request.ProjectCode ?? (object)DBNull.Value),
                        new SqlParameter("@LandId", request.LandId),
                        new SqlParameter("@ProjectName", request.ProjectName ?? (object)DBNull.Value),
                        new SqlParameter("@StartDate", request.StartDate),
                        new SqlParameter("@EndDate", request.EndDate),
                        new SqlParameter("@EstimatedInvestment", request.EstimatedInvestment),
                        new SqlParameter("@PaymentFrequency", request.PaymentFrequency ?? (object)DBNull.Value),
                        new SqlParameter("@TotalPlants", request.TotalPlants),
                        new SqlParameter("@Status", request.Status ?? (object)DBNull.Value),
                        new SqlParameter("@CreatedBy", request.CreatedBy)
                    )
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    projectId = result.FirstOrDefault()?.ProjectId,
                    projectName = result.FirstOrDefault()?.ProjectName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");

                return StatusCode(500, ex.Message);
            }
        }

        // ADD PROJECT CROPS
        [HttpPost("add-project-crops")]
        public async Task<IActionResult> AddProjectCrops(
            [FromBody] SaveProjectCropsRequestDto request)
        {
            try
            {
                var table = new DataTable();

                table.Columns.Add("CropId", typeof(int));
                table.Columns.Add("PlantCount", typeof(int));
                table.Columns.Add("CostPerPlant", typeof(decimal));
                table.Columns.Add("EstimatedYieldKg", typeof(decimal));
                table.Columns.Add("ExpectedHarvestDate", typeof(DateTime));
                table.Columns.Add("TotalEstimatedCost", typeof(decimal));

                foreach (var item in request.Crops)
                {
                    table.Rows.Add(
                        item.CropId,
                        item.PlantCount,
                        item.CostPerPlant,
                        item.EstimatedYieldKg,
                        item.ExpectedHarvestDate,
                        item.TotalEstimatedCost
                    );
                }

                var cropsParam = new SqlParameter("@ProjectCrops", table)
                {
                    SqlDbType = SqlDbType.Structured,
                    TypeName = "dbo.ProjectCropType"
                };

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"EXEC AddProjectCrops
                @ProjectId,
                @CreatedBy,
                @ProjectCrops",

                    new SqlParameter("@ProjectId", request.ProjectId),
                    new SqlParameter("@CreatedBy", request.CreatedBy),
                    cropsParam
                );

                return Ok(new
                {
                    success = true,
                    message = "Project crops added successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding project crops");

                return StatusCode(500, ex.Message);
            }
        }

        // ADD PROJECT INVESTORS
        [HttpPost("add-project-investors")]
        public async Task<IActionResult> AddProjectInvestors(
            [FromBody] SaveProjectInvestorsRequestDto request)
        {
            try
            {
                var table = new DataTable();

                table.Columns.Add("InvestorId", typeof(int));
                table.Columns.Add("ProjectCropId", typeof(int));
                table.Columns.Add("PlantCount", typeof(int));
                table.Columns.Add("AmountInvested", typeof(decimal));
                table.Columns.Add("InvestmentDate", typeof(DateTime));
                table.Columns.Add("PaymentFrequency", typeof(string));
                table.Columns.Add("InstallmentCount", typeof(int));
                table.Columns.Add("InstallmentAmount", typeof(decimal));
                table.Columns.Add("Status", typeof(string));

                foreach (var item in request.Investors)
                {
                    table.Rows.Add(
                        item.InvestorId,
                        item.ProjectCropId,
                        item.PlantCount,
                        item.AmountInvested,
                        item.InvestmentDate,
                        item.PaymentFrequency,
                        item.InstallmentCount,
                        item.InstallmentAmount,
                        item.Status
                    );
                }

                var investorsParam = new SqlParameter("@ProjectInvestors", table)
                {
                    SqlDbType = SqlDbType.Structured,
                    TypeName = "dbo.ProjectInvestorType"
                };

                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"EXEC AddProjectInvestors
                @ProjectId,
                @ProjectInvestors",

                    new SqlParameter("@ProjectId", request.ProjectId),
                    investorsParam
                );

                return Ok(new
                {
                    success = true,
                    message = "Project investors added successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding project investors");

                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("get-all-lands")]
        public async Task<IActionResult> GetAllLands(string? searchText = null)
        {
            var data = await _db.QueryAsync<dynamic>(
                "GetAllLands",
                new
                {
                    SearchText = searchText
                });

            return Ok(new
            {
                success = true,
                data
            });
        }

        // GET PROJECT CROPS BY PROJECT ID
        [HttpGet("get-project-crops")]
        public async Task<IActionResult> GetProjectCrops(
            int projectId)
        {
            var data = await _db.QueryAsync<dynamic>(
                "GetProjectCropsByProjectId",
                new
                {
                    ProjectId = projectId
                });

            return Ok(new
            {
                success = true,
                data
            });
        }

        // SEARCH INVESTORS
        [HttpGet("search-investors")]
        public async Task<IActionResult> SearchInvestors(
            string? search = null)
        {
            var data = await _db.QueryAsync<dynamic>(
                "SearchInvestors",
                new
                {
                    Search = search
                });

            return Ok(new
            {
                success = true,
                data
            });
        }
    }
}
