using FutbolAmigos.Api.Data;
using FutbolAmigos.Api.Dtos;
using FutbolAmigos.Api.Models;
using FutbolAmigos.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FutbolAmigos.Api.Controllers;

[ApiController]
[Route("api/scheduled-matches")]
[Authorize]
public class ScheduledMatchesController(FutbolAmigosDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ScheduledMatchListDto>>> GetAll([FromQuery] bool incluirPasados = false)
    {
        var query = db.ScheduledMatches
            .Include(sm => sm.CreadoPorUser)
            .Include(sm => sm.Attendances)
            .AsQueryable();

        if (!incluirPasados)
        {
            query = query.Where(sm => sm.Fecha >= DateTime.UtcNow);
        }

        var totalJugadores = await db.Players.CountAsync();

        var matches = await query
            .OrderBy(sm => sm.Fecha)
            .Select(sm => new ScheduledMatchListDto(
                sm.Id, sm.Fecha, sm.Lugar, sm.CupoMaximo,
                sm.CreadoPorUserId, sm.CreadoPorUser!.Nombre,
                totalJugadores,
                sm.Attendances.Count(a => a.Estado == AttendanceStatus.Va),
                sm.Attendances.Count(a => a.Estado == AttendanceStatus.Duda),
                sm.Attendances.Count(a => a.Estado == AttendanceStatus.No)))
            .ToListAsync();

        return Ok(matches);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ScheduledMatchDetailDto>> GetById(int id)
    {
        var match = await LoadScheduledMatch(id);
        if (match is null) return NotFound();

        return Ok(await ToDetailDtoAsync(match));
    }

    [HttpPost]
    public async Task<ActionResult<ScheduledMatchDetailDto>> Create(ScheduledMatchUpsertRequest request)
    {
        var validationError = Validate(request);
        if (validationError is not null) return BadRequest(validationError);

        var match = new ScheduledMatch
        {
            Fecha = request.Fecha,
            Lugar = request.Lugar.Trim(),
            CupoMaximo = request.CupoMaximo,
            Notas = string.IsNullOrWhiteSpace(request.Notas) ? null : request.Notas.Trim(),
            CreadoPorUserId = User.GetUserId(),
        };

        db.ScheduledMatches.Add(match);
        await db.SaveChangesAsync();

        var full = await LoadScheduledMatch(match.Id);
        return CreatedAtAction(nameof(GetById), new { id = match.Id }, await ToDetailDtoAsync(full!));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ScheduledMatchDetailDto>> Update(int id, ScheduledMatchUpsertRequest request)
    {
        var match = await db.ScheduledMatches.FindAsync(id);
        if (match is null) return NotFound();
        if (match.CreadoPorUserId != User.GetUserId()) return Forbid();

        var validationError = Validate(request);
        if (validationError is not null) return BadRequest(validationError);

        match.Fecha = request.Fecha;
        match.Lugar = request.Lugar.Trim();
        match.CupoMaximo = request.CupoMaximo;
        match.Notas = string.IsNullOrWhiteSpace(request.Notas) ? null : request.Notas.Trim();

        await db.SaveChangesAsync();

        var full = await LoadScheduledMatch(id);
        return Ok(await ToDetailDtoAsync(full!));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var match = await db.ScheduledMatches.FindAsync(id);
        if (match is null) return NotFound();
        if (match.CreadoPorUserId != User.GetUserId()) return Forbid();

        db.ScheduledMatches.Remove(match);
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:int}/attendance/{playerId:int}")]
    public async Task<ActionResult<AttendanceRosterDto>> SetAttendance(int id, int playerId, AttendanceUpsertRequest request)
    {
        var matchExists = await db.ScheduledMatches.AnyAsync(sm => sm.Id == id);
        if (!matchExists) return NotFound();

        var player = await db.Players.FindAsync(playerId);
        if (player is null) return NotFound();

        var attendance = await db.Attendances
            .FirstOrDefaultAsync(a => a.ScheduledMatchId == id && a.PlayerId == playerId);

        if (attendance is null)
        {
            attendance = new Attendance { ScheduledMatchId = id, PlayerId = playerId };
            db.Attendances.Add(attendance);
        }

        attendance.Estado = request.Estado;
        attendance.ActualizadoEn = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(new AttendanceRosterDto(player.Id, player.Nombre, player.Apodo, attendance.Estado, attendance.ActualizadoEn));
    }

    private static string? Validate(ScheduledMatchUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Lugar))
        {
            return "La cancha/lugar es obligatoria.";
        }

        if (request.CupoMaximo is not null && request.CupoMaximo <= 0)
        {
            return "El cupo máximo debe ser un número positivo.";
        }

        return null;
    }

    private Task<ScheduledMatch?> LoadScheduledMatch(int id) =>
        db.ScheduledMatches
            .Include(sm => sm.CreadoPorUser)
            .Include(sm => sm.Attendances)
            .FirstOrDefaultAsync(sm => sm.Id == id)!;

    private async Task<ScheduledMatchDetailDto> ToDetailDtoAsync(ScheduledMatch match)
    {
        var players = await db.Players.OrderBy(p => p.Nombre).ToListAsync();
        var attendanceByPlayer = match.Attendances.ToDictionary(a => a.PlayerId);

        var roster = players.Select(p =>
        {
            attendanceByPlayer.TryGetValue(p.Id, out var attendance);
            return new AttendanceRosterDto(p.Id, p.Nombre, p.Apodo, attendance?.Estado, attendance?.ActualizadoEn);
        }).ToList();

        return new ScheduledMatchDetailDto(
            match.Id, match.Fecha, match.Lugar, match.CupoMaximo, match.Notas,
            match.CreadoPorUserId, match.CreadoPorUser!.Nombre, roster);
    }
}
