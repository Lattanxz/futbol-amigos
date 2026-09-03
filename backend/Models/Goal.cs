namespace FutbolAmigos.Api.Models;

public class Goal
{
    public int Id { get; set; }
    public int MatchId { get; set; }
    public Match? Match { get; set; }

    public int PlayerId { get; set; }
    public Player? Player { get; set; }

    public Team Equipo { get; set; }
    public int? Minuto { get; set; }
    public GoalType Tipo { get; set; }

    public int? AsistenciaPlayerId { get; set; }
    public Player? AsistenciaPlayer { get; set; }
}
