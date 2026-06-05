using FarmApi.Models.DTO;
using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvestorController : ControllerBase
    {
        private readonly DbService _db;
        private readonly FarmerAppDbContext _dbContext;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<InvestorController> _logger;

        public InvestorController(DbService db, FarmerAppDbContext dbContext, IWebHostEnvironment webHostEnvironment, ILogger<InvestorController> logger)
        {
            _db = db;
            _dbContext = dbContext;
            _environment = webHostEnvironment;
            _logger = logger;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(
[FromForm] RegisterInvestorRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                string? aadhaarPath = null;
                string? panPath = null;

                // Aadhaar Upload
                if (request.AadhaarDocument != null)
                {
                    if (Path.GetExtension(request.AadhaarDocument.FileName)
                        .ToLower() != ".pdf")
                    {
                        return BadRequest("Aadhaar document must be PDF");
                    }

                    aadhaarPath = await SaveFile(request.AadhaarDocument);
                }

                // PAN Upload
                if (request.PANDocument != null)
                {
                    if (Path.GetExtension(request.PANDocument.FileName)
                        .ToLower() != ".pdf")
                    {
                        return BadRequest("PAN document must be PDF");
                    }

                    panPath = await SaveFile(request.PANDocument);
                }

                // Generate Password
                var generatedPassword =
                    GeneratePassword(
                        request.Name,
                        request.AadhaarNumber);

                // Execute SP
                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"EXEC SaveInvestor
        @Name,
        @MobileNumber,
        @Email,
        @Age,
        @AadhaarNumber,
        @PANNumber,
        @AadhaarDocumentUrl,
        @PANDocumentUrl,
        @AccountNumber,
        @IFSCCode,
        @PasswordHash,
        @CreatedBy",

                    new SqlParameter("@Name",
                        request.Name ?? (object)DBNull.Value),

                    new SqlParameter("@MobileNumber",
                        request.MobileNumber ?? (object)DBNull.Value),

                    new SqlParameter("@Email",
                        request.Email ?? (object)DBNull.Value),

                    new SqlParameter("@Age",
                        request.Age ?? (object)DBNull.Value),

                    new SqlParameter("@AadhaarNumber",
                        request.AadhaarNumber ?? (object)DBNull.Value),

                    new SqlParameter("@PANNumber",
                        request.PANNumber ?? (object)DBNull.Value),

                    new SqlParameter("@AadhaarDocumentUrl",
                        aadhaarPath ?? (object)DBNull.Value),

                    new SqlParameter("@PANDocumentUrl",
                        panPath ?? (object)DBNull.Value),

                    new SqlParameter("@AccountNumber",
                        request.AccountNumber ?? (object)DBNull.Value),

                    new SqlParameter("@IFSCCode",
                        request.IFSCCode ?? (object)DBNull.Value),

                    new SqlParameter("@PasswordHash",
                        generatedPassword),

                    new SqlParameter("@CreatedBy",
                        request.CreatedBy ?? (object)DBNull.Value)
                );

                return Ok(new
                {
                    success = true,
                    message = "Investor registered successfully",
                    password = generatedPassword
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering investor");

                return StatusCode(500, ex.Message);
            }
        }

        private async Task<string> SaveFile(IFormFile file)
        {
            var webRootPath = _environment.WebRootPath;

            if (string.IsNullOrEmpty(webRootPath))
            {
                webRootPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot");
            }

            var uploadFolder = Path.Combine(
                webRootPath,
                "uploads",
                "investors");

            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            var uniqueFileName =
                Guid.NewGuid().ToString() +
                Path.GetExtension(file.FileName);

            var filePath = Path.Combine(
                uploadFolder,
                uniqueFileName);

            using (var stream = new FileStream(
                filePath,
                FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return "/uploads/investors/" + uniqueFileName;
        }

        private string GeneratePassword(
            string? name,
            string? aadhaar)
        {
            var namePart = string.IsNullOrWhiteSpace(name)
                ? "INV"
                : name.Replace(" ", "")
                    .Substring(0,
                        Math.Min(3, name.Length))
                    .ToUpper();

            var aadhaarPart = string.IsNullOrWhiteSpace(aadhaar)
                ? "000"
                : aadhaar.Length >= 3
                    ? aadhaar.Substring(aadhaar.Length - 3)
                    : aadhaar;

            return $"{namePart}{aadhaarPart}";
        }

        [HttpPost("investor-login")]
        public async Task<IActionResult> InvestorLogin(
    [FromBody] InvestorLoginRequestDto dto)
        {
            try
            {
                var data = await _dbContext
                    .Set<InvestorLoginResponseDto>()
                    .FromSqlRaw(
                        "EXEC InvestorLogin @MobileNumber, @PasswordHash",

                        new SqlParameter("@MobileNumber", dto.MobileNumber),

                        new SqlParameter("@PasswordHash", dto.Password)
                    )
                    .ToListAsync();

                var result = data.FirstOrDefault();

                if (result == null)
                {
                    return Unauthorized(
                        new { message = "Invalid credentials" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("investor-profile/{investorId}")]
        public async Task<IActionResult> GetInvestorProfile(int investorId)
        {
            var results = await _dbContext
                .Set<InvestorProfileDto>()
                .FromSqlRaw(
                    "EXEC GetInvestorProfile @InvestorId",
                    new SqlParameter("@InvestorId", investorId))
                .ToListAsync();

            var result = results.FirstOrDefault();

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(
    [FromBody] UpdateInvestorProfileDto dto)
        {
            try
            {
                await _dbContext.Database.ExecuteSqlRawAsync(
                    @"EXEC UpdateInvestorProfile
                @InvestorId,
                @Name,
                @MobileNumber,
                @Email,
                @Age,
                @AccountNumber,
                @IFSCCode",

                    new SqlParameter("@InvestorId", dto.InvestorId),
                    new SqlParameter("@Name", dto.Name),
                    new SqlParameter("@MobileNumber", dto.MobileNumber),
                    new SqlParameter("@Email", dto.Email),
                    new SqlParameter("@Age", dto.Age),
                    new SqlParameter("@AccountNumber", dto.AccountNumber),
                    new SqlParameter("@IFSCCode", dto.IFSCCode)
                );

                return Ok(new
                {
                    success = true,
                    message = "Profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }





        [HttpGet("dashboard/{investorId}")]
        public async Task<IActionResult> GetDashboard(int investorId)
        {
            try
            {
                var dashboard = await _dbContext
                    .Set<InvestorDashboardDto>()
                    .FromSqlRaw(
                        "EXEC GetInvestorDashboard @InvestorId",
                        new SqlParameter("@InvestorId", investorId))
                    .ToListAsync();

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("investments/{investorId}")]
        public async Task<IActionResult> Investments(int investorId)
        {
            try
            {
                var result = await _dbContext.Database
                    .SqlQueryRaw<InvestorInvestmentDto>(
                        "EXEC GetInvestorInvestments @InvestorId={0}",
                        investorId)
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }




        [HttpGet("crop-allocation/{investorId}")]
        public async Task<IActionResult> CropAllocation(int investorId)
        {
            try
            {
                var result = await _dbContext.Database
                    .SqlQueryRaw<CropAllocationDto>(
                        "EXEC GetInvestorCropAllocation @InvestorId={0}",
                        investorId)
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("project/{projectInvestorId}")]
        public async Task<IActionResult> ProjectDetail(
    int projectInvestorId)
        {
            try
            {
                var result = await _dbContext.Database
                    .SqlQueryRaw<InvestorInvestmentDto>(
                        "EXEC GetInvestorProjectDetail @ProjectInvestorId={0}",
                        projectInvestorId)
                       .ToListAsync();
                  

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("payment-schedule/{investorId}")]
        public async Task<IActionResult> PaymentSchedule(int investorId)
        {
            try
            {
                var result = await _dbContext.Database
                    .SqlQueryRaw<InvestorPaymentScheduleDto>(
                        "EXEC GetInvestorPaymentSchedule @InvestorId={0}",
                        investorId)
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
