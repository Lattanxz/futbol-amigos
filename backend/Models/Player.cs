namespace FutbolAmigos.Api.Models;

public class Player
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string? Apodo { get; set; }
    public string? FotoUrl { get; set; }
    public string? PosicionHabitual { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }
}
