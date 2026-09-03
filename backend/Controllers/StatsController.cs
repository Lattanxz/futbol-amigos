using FutbolAmigos.Api.Data;
using FutbolAmigos.Api.Dtos;
using FutbolAmigos.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FutbolAmigos.Api.Controllers;

[ApiController]
[Route("api/stats")]
[Authorize]
public class StatsController(FutbolAmigosDbContext db) : ControllerBase
{
    private const int TopN = 10;

    [HttpGet("ranking")]
    public async Task<ActionResult<RankingDto>> GetRanking()
    {
        var players = await db.Players.ToListAsync();

        var golesPorJugador = await db.Goals
            .GroupBy(g => g.PlayerId)
            .Select(g => new { PlayerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PlayerId, x => x.Count);

        var asistenciasPorJugador = await db.Goals
            .Where(g => g.AsistenciaPlayerId != null)
            .GroupBy(g => g.AsistenciaPlayerId!.Value)
            .Select(g => new { PlayerId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PlayerId, x => x.Count);

        var matchPlayerRows = await db.MatchPlayers
            .Select(mp => new { mp.PlayerId, mp.Equipo, mp.Match!.GolesEquipoA, mp.Match!.GolesEquipoB })
            .ToListAsync();

        var porJugador = matchPlayerRows.GroupBy(r => r.PlayerId).ToDictionary(
            g => g.Key,
            g => new
            {
                PartidosJugados = g.Count(),
                Victorias = g.Count(r =>
                    (r.Equipo == Team.A && r.GolesEquipoA > r.GolesEquipoB) ||
                    (r.Equipo == Team.B && r.GolesEquipoB > r.GolesEquipoA)),
            });

        RankingEntryDto Entry(Player p, double valor) => new(p.Id, p.Nombre, p.Apodo, valor);

        var goleadores = players
            .Where(p => golesPorJugador.ContainsKey(p.Id))
            .Select(p => Entry(p, golesPorJugador[p.Id]))
            .OrderByDescending(e => e.Valor)
            .ThenBy(e => e.Nombre)
            .Take(TopN)
            .ToList();

        var masAsistencias = players
            .Where(p => asistenciasPorJugador.ContainsKey(p.Id))
            .Select(p => Entry(p, asistenciasPorJugador[p.Id]))
            .OrderByDescending(e => e.Valor)
            .ThenBy(e => e.Nombre)
            .Take(TopN)
            .ToList();

        var masPartidos = players
            .Where(p => porJugador.ContainsKey(p.Id))
            .Select(p => Entry(p, porJugador[p.Id].PartidosJugados))
            .OrderByDescending(e => e.Valor)
            .ThenBy(e => e.Nombre)
            .Take(TopN)
            .ToList();

        var mejorPorcentaje = players
            .Where(p => porJugador.ContainsKey(p.Id))
            .Select(p => Entry(p, Math.Round(100.0 * porJugador[p.Id].Victorias / porJugador[p.Id].PartidosJugados, 1)))
            .OrderByDescending(e => e.Valor)
            .ThenBy(e => e.Nombre)
            .Take(TopN)
            .ToList();

        return Ok(new RankingDto(goleadores, masPartidos, masAsistencias, mejorPorcentaje));
    }
}
