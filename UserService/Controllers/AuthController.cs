using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserService.DTOs;
using UserService.Services;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger      = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterDto dto)
        {
            _logger.LogInformation(
                "Register attempt for: {Email}", dto.Email);

            bool success = await _authService.RegisterAsync(dto);
            if (!success)
                return BadRequest(
                    new { message = "Email is already registered." });

            return StatusCode(201,
                new { message = "Account created. Please log in." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            _logger.LogInformation(
                "Login attempt for: {Email}", dto.Email);

            var token = await _authService.LoginAsync(dto);
            if (token == null)
                return Unauthorized(
                    new { message = "Invalid email or password." });

            return Ok(new { token });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            var profile = await _authService
                .GetProfileAsync(int.Parse(userIdClaim));
            if (profile == null)
                return NotFound(new { message = "User not found." });

            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] UpdateProfileDto dto)
        {
            var userIdClaim = User.FindFirst(
                ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            var updated = await _authService
                .UpdateProfileAsync(int.Parse(userIdClaim), dto);
            if (updated == null)
                return NotFound(new { message = "User not found." });

            return Ok(updated);
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _authService.GetByIdAsync(id);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email
            });
        }
    }
}