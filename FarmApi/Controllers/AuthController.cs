using FarmApi.Models.DTO;
using FarmApi.Models.Request;
using FarmApi.Models.Response;
using FarmApi.Services;
using FarmerApp.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DbService _db;
        private readonly IJwtService _jwt;
        private readonly FarmerAppDbContext _dbContext;

        public AuthController(DbService db, IJwtService jwt, FarmerAppDbContext dbContext)
        {
            _db = db;
            _jwt = jwt;
            _dbContext = dbContext;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.PhoneNumber))
                return BadRequest("Phone number is required");

            var result = await _dbContext.SendOtpResults
                    .FromSqlRaw("EXEC GenerateOTP @PhoneNumber",
                    new SqlParameter("@PhoneNumber", request.PhoneNumber))
                    .ToListAsync();
            if (result == null)
                return StatusCode(500, "Failed to send OTP");

            return Ok(result);
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.PhoneNumber))
                return BadRequest("Phone number is required");

            var result = await _dbContext.ResendOtpResponseDtos
                .FromSqlRaw(
                    "EXEC ResendOTP @PhoneNumber",
                    new SqlParameter("@PhoneNumber", request.PhoneNumber)
                )
                .ToListAsync();

            if (result == null || result.Count == 0)
                return StatusCode(500, "Failed to resend OTP");


            return Ok(result.FirstOrDefault());
        }


        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] OTPRequestModelcs model)
        {
            var result = await _dbContext
                .Set<VerifyOtpResponseDto>()
                .FromSqlRaw(
                    "EXEC VerifyFarmerOTP @PhoneNumber, @OTP",
                    new SqlParameter("@PhoneNumber", model.PhoneNumber),
                    new SqlParameter("@OTP", model.Otp)
                )
                .ToListAsync();

            return Ok(result.FirstOrDefault());
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Phone) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new AuthResponse { Success = false, Message = "Phone and password required." });

            var users = await _db.QueryAsync<dynamic>(
                "Login",   // your SP
                new { Phone = req.Phone }
            );

            var user = users.FirstOrDefault();

            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized(new AuthResponse { Success = false, Message = "Invalid credentials." });

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Phone = user.Phone,
                RoleId = user.RoleId,
                FarmerId = user.FarmerId
            };

            var token = _jwt.GenerateToken(userDto);

            return Ok(new AuthResponse
            {
                Success = true,
                Token = token,
                Message = "Login successful",
                User = userDto
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Phone) ||
                string.IsNullOrWhiteSpace(req.Password) ||
                string.IsNullOrWhiteSpace(req.Name))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Required fields missing." });
            }

            var existing = await _db.QueryAsync<dynamic>(
                "Login",
                new { Phone = req.Phone }
            );

            if (existing.Any())
                return Conflict(new AuthResponse { Success = false, Message = "Phone already exists." });

            var hashed = BCrypt.Net.BCrypt.HashPassword(req.Password);

            await _db.ExecuteAsync(
                "SaveUser",
                new
                {
                    UserId = 0,
                    Name = req.Name,
                    Phone = req.Phone,
                    PasswordHash = hashed,
                    RoleId = req.RoleId,
                    FarmerId = (int?)null,
                    UserIdAudit = 1
                }
            );

            var userDto = new UserDto
            {
                Name = req.Name,
                Phone = req.Phone,
                RoleId = req.RoleId,
                FarmerId = (int?)null
            };

            var token = _jwt.GenerateToken(userDto);

            return Ok(new AuthResponse
            {
                Success = true,
                Token = token,
                Message = "Registration successful",
                User = userDto
            });
        }

        [HttpGet("test-db")]
        public IActionResult TestDb()
        {
            try
            {
                _dbContext.Database.CanConnect();

                return Ok("Connected");
            }
            catch (Exception ex)
            {
                return Ok(ex.ToString());
            }
        }

        [HttpPost("admin-login")]
        public async Task<IActionResult> Login(
      [FromBody] AdminLoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.MobileNumber)
                || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Phone and password required"
                });
            }
            try
            {

        
            var result = await _dbContext
                .AdminLoginResponses
                .FromSqlRaw(
                    "EXEC UserLoginValidation @Phone ,@Password",
                    new SqlParameter(
                        "@Phone",
                        request.MobileNumber
                    ),
                          new SqlParameter(
                        "@Password",
                        request.Password
                    )
                )
                .ToListAsync();

            var user = result.FirstOrDefault();

            // User not found
            if (user == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid mobile number"
                });
            }

           
            // Success
            return Ok(new
            {
                success = true,

                message = "Login successful",

                data = new
                {
                    userId = user.UserId,
                    name = user.Name,
                    phone = user.Phone,
                    roleId = user.RoleId
                }
            });
            }catch(Exception ex)
            {
                return StatusCode(500);

               

            }
        }
    }
}




