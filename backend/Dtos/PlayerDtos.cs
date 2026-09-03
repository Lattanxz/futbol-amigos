namespace FutbolAmigos.Api.Dtos;

public record PlayerListDto(
    int Id,
    string Nombre,
    string? Apodo,
    string? FotoUrl,
    string? PosicionHabitual);

public record PlayerDetailDto(
    int Id,
    string Nombre,
    string? Apodo,
    string? FotoUrl,
    string? PosicionHabitual,
    int PartidosJugados,
    int Goles,
    int Asistencias,
    int Victorias,
    int Empates,
    int Derrotas,
    double PorcentajeVictorias);

public record PlayerUpsertRequest(
    string Nombre,
    string? Apodo,
    string? FotoUrl,
    string? PosicionHabitual,
    int? UserId);
