using FutbolAmigos.Api.Data;
using FutbolAmigos.Api.Dtos;
using FutbolAmigos.Api.Models;
using FutbolAmigos.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FutbolAmigos.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController(FutbolAmigosDbContext db, JwtTokenService jwt) : ControllerBase
{
    private static readonly PasswordHasher<User> Hasher = new();

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nombre) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Nombre, email y password son obligatorios.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            return Conflict("Ya existe un usuario con ese email.");
        }

        var user = new User { Nombre = request.Nombre.Trim(), Email = email };
        user.PasswordHash = Hasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var (token, expiresAt) = jwt.CreateToken(user);
        return Ok(new AuthResponse(token, expiresAt, new UserDto(user.Id, user.Nombre, user.Email)));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            return Unauthorized("Email o contraseña incorrectos.");
        }

        var result = Hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Email o contraseña incorrectos.");
        }

        var (token, expiresAt) = jwt.CreateToken(user);
        return Ok(new AuthResponse(token, expiresAt, new UserDto(user.Id, user.Nombre, user.Email)));
    }
}
