using FutbolAmigos.Api.Models;

namespace FutbolAmigos.Api.Dtos;

public record MatchPlayerRequest(int PlayerId, string PosicionSlot);

public record MatchTeamRequest(Team Equipo, string Formacion, List<MatchPlayerRequest> Jugadores);

public record GoalRequest(int PlayerId, Team Equipo, int? Minuto, GoalType Tipo, int? AsistenciaPlayerId);

public record CardRequest(int PlayerId, CardType Tipo, int? Minuto);

public record MatchUpsertRequest(
    DateTime Fecha,
    string Lugar,
    List<MatchTeamRequest> Equipos,
    int GolesEquipoA,
    int GolesEquipoB,
    List<GoalRequest> Goles,
    List<CardRequest> Tarjetas);

public record MatchListDto(
    int Id,
    DateTime Fecha,
    string Lugar,
    int GolesEquipoA,
    int GolesEquipoB,
    int CreadoPorUserId,
    string CreadoPorNombre);

public record MatchPlayerDto(int PlayerId, string Nombre, string? Apodo, string PosicionSlot);

public record MatchTeamDto(Team Equipo, string Formacion, List<MatchPlayerDto> Jugadores);

public record GoalDto(
    int Id,
    int PlayerId,
    string NombreJugador,
    Team Equipo,
    int? Minuto,
    GoalType Tipo,
    int? AsistenciaPlayerId,
    string? AsistenciaNombre);

public record CardDto(int Id, int PlayerId, string NombreJugador, CardType Tipo, int? Minuto);

public record MatchDetailDto(
    int Id,
    DateTime Fecha,
    string Lugar,
    int GolesEquipoA,
    int GolesEquipoB,
    int CreadoPorUserId,
    string CreadoPorNombre,
    List<MatchTeamDto> Equipos,
    List<GoalDto> Goles,
    List<CardDto> Tarjetas);
