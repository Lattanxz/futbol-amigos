namespace FutbolAmigos.Api.Models;

public class ScheduledMatch
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Lugar { get; set; } = "";
    public int? CupoMaximo { get; set; }
    public string? Notas { get; set; }

    public int CreadoPorUserId { get; set; }
    public User? CreadoPorUser { get; set; }

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
