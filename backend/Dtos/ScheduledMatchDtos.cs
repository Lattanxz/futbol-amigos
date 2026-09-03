using FutbolAmigos.Api.Models;

namespace FutbolAmigos.Api.Dtos;

public record ScheduledMatchUpsertRequest(DateTime Fecha, string Lugar, int? CupoMaximo, string? Notas);

public record AttendanceUpsertRequest(AttendanceStatus Estado);

public record AttendanceRosterDto(
    int PlayerId,
    string Nombre,
    string? Apodo,
    AttendanceStatus? Estado,
    DateTime? ActualizadoEn);

public record ScheduledMatchListDto(
    int Id,
    DateTime Fecha,
    string Lugar,
    int? CupoMaximo,
    int CreadoPorUserId,
    string CreadoPorNombre,
    int TotalJugadores,
    int CantidadVa,
    int CantidadDuda,
    int CantidadNo);

public record ScheduledMatchDetailDto(
    int Id,
    DateTime Fecha,
    string Lugar,
    int? CupoMaximo,
    string? Notas,
    int CreadoPorUserId,
    string CreadoPorNombre,
    List<AttendanceRosterDto> Roster);
