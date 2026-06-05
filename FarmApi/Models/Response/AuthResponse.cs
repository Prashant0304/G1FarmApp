using FarmApi.Models.DTO;

namespace FarmApi.Models.Response
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public string Message { get; set; }
        public UserDto User { get; set; }
    }
}
