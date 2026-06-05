using FarmApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FarmApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly DbService _db;

        public NotificationController(DbService db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Get(int userId, int pageNumber = 1, int pageSize = 10)
        {
            var (data, total) = await _db.QueryPagedAsync<dynamic>(
                "GetNotifications",
                new { UserId = userId, PageNumber = pageNumber, PageSize = pageSize });

            return Ok(new { data, total });
        }
    }
}
