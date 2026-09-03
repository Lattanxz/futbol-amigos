namespace FutbolAmigos.Api.Models;

public class MatchTeam
{
    public int Id { get; set; }
    public int MatchId { get; set; }
    public Match? Match { get; set; }

    public Team Equipo { get; set; }
    public string Formacion { get; set; } = "";
}
