using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Space.Api.Data;
using Space.Api.Data.Entities;
using Space.Api.Models.Auth;

namespace Space.Api.Services;

public interface IAuthService
{
    Task<(AuthResponse? response, string? error)> RegisterAsync(RegisterRequest request);
    Task<(AuthResponse? response, string? error)> LoginAsync(LoginRequest request);
    Task<(AuthResponse? response, string? error)> RefreshTokenAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(string refreshToken);
}

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext context,
        IJwtService jwtService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<(AuthResponse? response, string? error)> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return (null, "User with this email already exists");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName ?? request.Email.Split('@')[0]
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return (null, errors);
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<(AuthResponse? response, string? error)> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return (null, "Invalid credentials");
        }

        var isValidPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isValidPassword)
        {
            return (null, "Invalid credentials");
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<(AuthResponse? response, string? error)> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken);

        if (storedToken == null)
        {
            return (null, "Invalid refresh token");
        }

        if (!storedToken.IsActive)
        {
            return (null, "Refresh token is expired or revoked");
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GenerateAuthResponseAsync(storedToken.User);
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == refreshToken);

        if (storedToken != null && storedToken.IsActive)
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private async Task<(AuthResponse? response, string? error)> GenerateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _jwtService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtService.GenerateRefreshToken();

        var refreshTokenDays = int.Parse(_configuration["Jwt:RefreshTokenExpiresInDays"] ?? "7");
        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays)
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync();

        var expiresInMinutes = int.Parse(_configuration["Jwt:ExpiresInMinutes"] ?? "60");

        return (new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes),
            User = new UserInfo
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                DisplayName = user.DisplayName,
                Roles = roles.ToList()
            }
        }, null);
    }
}
