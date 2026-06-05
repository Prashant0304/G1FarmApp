using Microsoft.Data.SqlClient;
using System.Net;
using System.Text.Json;

namespace FarmApi.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled Exception");

                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            var response = new
            {
                success = false,
                message = "Something went wrong",
                errorCode = "SERVER_ERROR"
            };

            switch (ex)
            {
                // 🔹 SQL Errors
                case SqlException sqlEx:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                    response = new
                    {
                        success = false,
                        message = GetSqlMessage(sqlEx),
                        errorCode = "SQL_ERROR"
                    };
                    break;

                case ArgumentNullException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                    response = new
                    {
                        success = false,
                        message = "Required value is missing",
                        errorCode = "NULL_ERROR"
                    };
                    break;

                case ArgumentException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                    response = new
                    {
                        success = false,
                        message = ex.Message,
                        errorCode = "VALIDATION_ERROR"
                    };
                    break;

                // 🔹 Unauthorized
                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;

                    response = new
                    {
                        success = false,
                        message = "Unauthorized access",
                        errorCode = "UNAUTHORIZED"
                    };
                    break;

                // 🔹 Default fallback
                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            var json = JsonSerializer.Serialize(response);

            await context.Response.WriteAsync(json);
        }

        // 🔥 Custom SQL error handling
        private static string GetSqlMessage(SqlException ex)
        {
            return ex.Number switch
            {
                2627 => "Duplicate entry (already exists)",
                2601 => "Duplicate value",
                547 => "Invalid reference (foreign key constraint)",
                2812 => "Stored procedure not found",
                _ => "Database error occurred"
            };
        }
    }
}
