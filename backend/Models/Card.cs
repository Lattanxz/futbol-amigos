namespace FutbolAmigos.Api.Models;

public class Card
{
    public int Id { get; set; }
    public int MatchId { get; set; }
    public Match? Match { get; set; }

    public int PlayerId { get; set; }
    public Player? Player { get; set; }

    public CardType Tipo { get; set; }
    public int? Minuto { get; set; }
}
