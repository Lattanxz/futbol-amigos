using FutbolAmigos.Api.Data;
using FutbolAmigos.Api.Dtos;
using FutbolAmigos.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FutbolAmigos.Api.Controllers;

[ApiController]
[Route("api/players")]
[Authorize]
public class PlayersController(FutbolAmigosDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PlayerListDto>>> GetAll()
    {
        var players = await db.Players
            .OrderBy(p => p.Nombre)
            .Select(p => new PlayerListDto(p.Id, p.Nombre, p.Apodo, p.FotoUrl, p.PosicionHabitual))
            .ToListAsync();

        return Ok(players);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PlayerDetailDto>> GetById(int id)
    {
        var player = await db.Players.FindAsync(id);
        if (player is null) return NotFound();

        var matchPlayers = await db.MatchPlayers
            .Where(mp => mp.PlayerId == id)
            .Select(mp => new { mp.Equipo, mp.Match!.GolesEquipoA, mp.Match!.GolesEquipoB })
            .ToListAsync();

        int partidosJugados = matchPlayers.Count;
        int victorias = matchPlayers.Count(mp =>
            (mp.Equipo == Team.A && mp.GolesEquipoA > mp.GolesEquipoB) ||
            (mp.Equipo == Team.B && mp.GolesEquipoB > mp.GolesEquipoA));
        int empates = matchPlayers.Count(mp => mp.GolesEquipoA == mp.GolesEquipoB);
        int derrotas = partidosJugados - victorias - empates;

        int goles = await db.Goals.CountAsync(g => g.PlayerId == id);
        int asistencias = await db.Goals.CountAsync(g => g.AsistenciaPlayerId == id);

        double porcentajeVictorias = partidosJugados == 0 ? 0 : Math.Round(100.0 * victorias / partidosJugados, 1);

        return Ok(new PlayerDetailDto(
            player.Id, player.Nombre, player.Apodo, player.FotoUrl, player.PosicionHabitual,
            partidosJugados, goles, asistencias, victorias, empates, derrotas, porcentajeVictorias));
    }

    [HttpPost]
    public async Task<ActionResult<PlayerListDto>> Create(PlayerUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nombre))
        {
            return BadRequest("El nombre es obligatorio.");
        }

        var player = new Player
        {
            Nombre = request.Nombre.Trim(),
            Apodo = request.Apodo,
            FotoUrl = request.FotoUrl,
            PosicionHabitual = request.PosicionHabitual,
            UserId = request.UserId,
        };

        db.Players.Add(player);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = player.Id },
            new PlayerListDto(player.Id, player.Nombre, player.Apodo, player.FotoUrl, player.PosicionHabitual));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PlayerListDto>> Update(int id, PlayerUpsertRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nombre))
        {
            return BadRequest("El nombre es obligatorio.");
        }

        var player = await db.Players.FindAsync(id);
        if (player is null) return NotFound();

        player.Nombre = request.Nombre.Trim();
        player.Apodo = request.Apodo;
        player.FotoUrl = request.FotoUrl;
        player.PosicionHabitual = request.PosicionHabitual;
        player.UserId = request.UserId;

        await db.SaveChangesAsync();

        return Ok(new PlayerListDto(player.Id, player.Nombre, player.Apodo, player.FotoUrl, player.PosicionHabitual));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var player = await db.Players.FindAsync(id);
        if (player is null) return NotFound();

        var tieneHistorial = await db.MatchPlayers.AnyAsync(mp => mp.PlayerId == id)
            || await db.Goals.AnyAsync(g => g.PlayerId == id || g.AsistenciaPlayerId == id)
            || await db.Cards.AnyAsync(c => c.PlayerId == id)
            || await db.Attendances.AnyAsync(a => a.PlayerId == id);

        if (tieneHistorial)
        {
            return Conflict("No se puede eliminar un jugador que ya tiene partidos, goles, tarjetas o confirmaciones de asistencia registrados.");
        }

        db.Players.Remove(player);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
