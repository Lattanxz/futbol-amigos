namespace FutbolAmigos.Api.Models;

public class Match
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Lugar { get; set; } = "";
    public int GolesEquipoA { get; set; }
    public int GolesEquipoB { get; set; }

    public int CreadoPorUserId { get; set; }
    public User? CreadoPorUser { get; set; }

    public ICollection<MatchTeam> Teams { get; set; } = new List<MatchTeam>();
    public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();
    public ICollection<Card> Cards { get; set; } = new List<Card>();
}
