using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FutbolAmigos.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace FutbolAmigos.Api.Services;

public class JwtTokenService(IConfiguration config)
{
    public (string Token, DateTime ExpiresAt) CreateToken(User user)
    {
        var key = config["Jwt:Key"]
            ?? throw new InvalidOperationException("Falta configurar Jwt:Key (dotnet user-secrets set \"Jwt:Key\" \"...\").");
        var issuer = config["Jwt:Issuer"] ?? "FutbolAmigos";
        var audience = config["Jwt:Audience"] ?? "FutbolAmigos";
        var expiryDays = double.TryParse(config["Jwt:ExpiryDays"], out var d) ? d : 7;

        var expiresAt = DateTime.UtcNow.AddDays(expiryDays);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Name, user.Nombre),
            new(JwtRegisteredClaimNames.Email, user.Email),
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
