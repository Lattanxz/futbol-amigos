using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FutbolAmigos.Api.Services;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.Parse(value ?? throw new InvalidOperationException("Token sin claim de usuario."));
    }
}
