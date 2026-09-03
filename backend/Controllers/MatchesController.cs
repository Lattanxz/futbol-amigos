using FutbolAmigos.Api.Data;
using FutbolAmigos.Api.Dtos;
using FutbolAmigos.Api.Models;
using FutbolAmigos.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FutbolAmigos.Api.Controllers;

[ApiController]
[Route("api/matches")]
[Authorize]
public class MatchesController(FutbolAmigosDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<MatchListDto>>> GetAll(
        [FromQuery] int? jugadorId,
        [FromQuery] string? cancha,
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
    {
        var query = db.Matches.Include(m => m.CreadoPorUser).AsQueryable();

        if (jugadorId is not null)
        {
            query = query.Where(m => m.MatchPlayers.Any(mp => mp.PlayerId == jugadorId));
        }

        if (!string.IsNullOrWhiteSpace(cancha))
        {
            query = query.Where(m => m.Lugar.Contains(cancha));
        }

        if (desde is not null)
        {
            query = query.Where(m => m.Fecha >= desde.Value);
        }

        if (hasta is not null)
        {
            query = query.Where(m => m.Fecha <= hasta.Value);
        }

        var matches = await query
            .OrderByDescending(m => m.Fecha)
            .Select(m => new MatchListDto(
                m.Id, m.Fecha, m.Lugar, m.GolesEquipoA, m.GolesEquipoB,
                m.CreadoPorUserId, m.CreadoPorUser!.Nombre))
            .ToListAsync();

        return Ok(matches);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MatchDetailDto>> GetById(int id)
    {
        var match = await LoadFullMatch(id);
        if (match is null) return NotFound();

        return Ok(ToDetailDto(match));
    }

    [HttpPost]
    public async Task<ActionResult<MatchDetailDto>> Create(MatchUpsertRequest request)
    {
        var validationError = await ValidateAsync(request);
        if (validationError is not null) return BadRequest(validationError);

        var match = new Match
        {
            Fecha = request.Fecha,
            Lugar = request.Lugar.Trim(),
            GolesEquipoA = request.GolesEquipoA,
            GolesEquipoB = request.GolesEquipoB,
            CreadoPorUserId = User.GetUserId(),
        };

        ApplyChildren(match, request);

        db.Matches.Add(match);
        await db.SaveChangesAsync();

        var full = await LoadFullMatch(match.Id);
        return CreatedAtAction(nameof(GetById), new { id = match.Id }, ToDetailDto(full!));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<MatchDetailDto>> Update(int id, MatchUpsertRequest request)
    {
        var match = await db.Matches
            .Include(m => m.Teams)
            .Include(m => m.MatchPlayers)
            .Include(m => m.Goals)
            .Include(m => m.Cards)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (match is null) return NotFound();
        if (match.CreadoPorUserId != User.GetUserId()) return Forbid();

        var validationError = await ValidateAsync(request);
        if (validationError is not null) return BadRequest(validationError);

        match.Fecha = request.Fecha;
        match.Lugar = request.Lugar.Trim();
        match.GolesEquipoA = request.GolesEquipoA;
        match.GolesEquipoB = request.GolesEquipoB;

        db.MatchTeams.RemoveRange(match.Teams);
        db.MatchPlayers.RemoveRange(match.MatchPlayers);
        db.Goals.RemoveRange(match.Goals);
        db.Cards.RemoveRange(match.Cards);
        match.Teams.Clear();
        match.MatchPlayers.Clear();
        match.Goals.Clear();
        match.Cards.Clear();

        ApplyChildren(match, request);

        await db.SaveChangesAsync();

        var full = await LoadFullMatch(id);
        return Ok(ToDetailDto(full!));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var match = await db.Matches.FindAsync(id);
        if (match is null) return NotFound();
        if (match.CreadoPorUserId != User.GetUserId()) return Forbid();

        db.Matches.Remove(match);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static void ApplyChildren(Match match, MatchUpsertRequest request)
    {
        foreach (var equipo in request.Equipos)
        {
            match.Teams.Add(new MatchTeam { Equipo = equipo.Equipo, Formacion = equipo.Formacion });

            foreach (var jugador in equipo.Jugadores)
            {
                match.MatchPlayers.Add(new MatchPlayer
                {
                    PlayerId = jugador.PlayerId,
                    Equipo = equipo.Equipo,
                    PosicionSlot = jugador.PosicionSlot,
                });
            }
        }

        foreach (var gol in request.Goles)
        {
            match.Goals.Add(new Goal
            {
                PlayerId = gol.PlayerId,
                Equipo = gol.Equipo,
                Minuto = gol.Minuto,
                Tipo = gol.Tipo,
                AsistenciaPlayerId = gol.AsistenciaPlayerId,
            });
        }

        foreach (var tarjeta in request.Tarjetas)
        {
            match.Cards.Add(new Card
            {
                PlayerId = tarjeta.PlayerId,
                Tipo = tarjeta.Tipo,
                Minuto = tarjeta.Minuto,
            });
        }
    }

    private async Task<string?> ValidateAsync(MatchUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Lugar))
        {
            return "La cancha/lugar es obligatoria.";
        }

        if (request.Equipos.Count != 2 || request.Equipos.Select(e => e.Equipo).Distinct().Count() != 2)
        {
            return "El partido debe tener exactamente un equipo A y un equipo B.";
        }

        foreach (var equipo in request.Equipos)
        {
            if (string.IsNullOrWhiteSpace(equipo.Formacion))
            {
                return "Cada equipo debe tener una formación.";
            }

            var slots = equipo.Jugadores.Select(j => j.PosicionSlot).ToList();
            if (slots.Count != slots.Distinct().Count())
            {
                return $"Hay posiciones repetidas en el equipo {equipo.Equipo}.";
            }
        }

        var allPlayerIds = request.Equipos.SelectMany(e => e.Jugadores.Select(j => j.PlayerId)).ToList();
        if (allPlayerIds.Count != allPlayerIds.Distinct().Count())
        {
            return "Un jugador no puede estar en los dos equipos ni repetido en el mismo equipo.";
        }

        var referencedPlayerIds = allPlayerIds
            .Concat(request.Goles.Select(g => g.PlayerId))
            .Concat(request.Goles.Where(g => g.AsistenciaPlayerId is not null).Select(g => g.AsistenciaPlayerId!.Value))
            .Concat(request.Tarjetas.Select(t => t.PlayerId))
            .Distinct()
            .ToList();

        var existingCount = await db.Players.CountAsync(p => referencedPlayerIds.Contains(p.Id));
        if (existingCount != referencedPlayerIds.Count)
        {
            return "Uno o más jugadores referenciados no existen.";
        }

        return null;
    }

    private Task<Match?> LoadFullMatch(int id) =>
        db.Matches
            .Include(m => m.CreadoPorUser)
            .Include(m => m.Teams)
            .Include(m => m.MatchPlayers).ThenInclude(mp => mp.Player)
            .Include(m => m.Goals).ThenInclude(g => g.Player)
            .Include(m => m.Goals).ThenInclude(g => g.AsistenciaPlayer)
            .Include(m => m.Cards).ThenInclude(c => c.Player)
            .AsSplitQuery()
            .FirstOrDefaultAsync(m => m.Id == id)!;

    private static MatchDetailDto ToDetailDto(Match match)
    {
        var equipos = match.Teams
            .Select(t => new MatchTeamDto(
                t.Equipo,
                t.Formacion,
                match.MatchPlayers
                    .Where(mp => mp.Equipo == t.Equipo)
                    .Select(mp => new MatchPlayerDto(mp.PlayerId, mp.Player!.Nombre, mp.Player.Apodo, mp.PosicionSlot))
                    .ToList()))
            .ToList();

        var goles = match.Goals
            .Select(g => new GoalDto(
                g.Id, g.PlayerId, g.Player!.Nombre, g.Equipo, g.Minuto, g.Tipo,
                g.AsistenciaPlayerId, g.AsistenciaPlayer?.Nombre))
            .ToList();

        var tarjetas = match.Cards
            .Select(c => new CardDto(c.Id, c.PlayerId, c.Player!.Nombre, c.Tipo, c.Minuto))
            .ToList();

        return new MatchDetailDto(
            match.Id, match.Fecha, match.Lugar, match.GolesEquipoA, match.GolesEquipoB,
            match.CreadoPorUserId, match.CreadoPorUser!.Nombre, equipos, goles, tarjetas);
    }
}
