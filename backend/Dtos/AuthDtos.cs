namespace FutbolAmigos.Api.Dtos;

public record RegisterRequest(string Nombre, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record UserDto(int Id, string Nombre, string Email);

public record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
