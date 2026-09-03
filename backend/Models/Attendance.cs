namespace FutbolAmigos.Api.Models;

public class Attendance
{
    public int Id { get; set; }

    public int ScheduledMatchId { get; set; }
    public ScheduledMatch? ScheduledMatch { get; set; }

    public int PlayerId { get; set; }
    public Player? Player { get; set; }

    public AttendanceStatus Estado { get; set; }
    public DateTime ActualizadoEn { get; set; }
}
