namespace FutbolAmigos.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";

    public ICollection<Player> Players { get; set; } = new List<Player>();
    public ICollection<Match> MatchesCreated { get; set; } = new List<Match>();
    public ICollection<ScheduledMatch> ScheduledMatchesCreated { get; set; } = new List<ScheduledMatch>();
}
