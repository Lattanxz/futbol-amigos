using FutbolAmigos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FutbolAmigos.Api.Data;

public class FutbolAmigosDbContext(DbContextOptions<FutbolAmigosDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<MatchTeam> MatchTeams => Set<MatchTeam>();
    public DbSet<MatchPlayer> MatchPlayers => Set<MatchPlayer>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<ScheduledMatch> ScheduledMatches => Set<ScheduledMatch>();
    public DbSet<Attendance> Attendances => Set<Attendance>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Player>()
            .HasOne(p => p.User)
            .WithMany(u => u.Players)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Match>()
            .HasOne(m => m.CreadoPorUser)
            .WithMany(u => u.MatchesCreated)
            .HasForeignKey(m => m.CreadoPorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // La app no maneja zonas horarias: Fecha es siempre el horario local "de pared"
        // tal cual lo tipea el usuario (viene de un <input type="datetime-local">, sin
        // offset). Se mapea a "timestamp without time zone" en vez del timestamptz por
        // default para no forzar un Kind=Utc en Npgsql ni correr el horario al mostrarlo.
        modelBuilder.Entity<Match>()
            .Property(m => m.Fecha)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<MatchTeam>()
            .HasOne(mt => mt.Match)
            .WithMany(m => m.Teams)
            .HasForeignKey(mt => mt.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MatchPlayer>()
            .HasOne(mp => mp.Match)
            .WithMany(m => m.MatchPlayers)
            .HasForeignKey(mp => mp.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MatchPlayer>()
            .HasOne(mp => mp.Player)
            .WithMany()
            .HasForeignKey(mp => mp.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MatchPlayer>()
            .HasIndex(mp => new { mp.MatchId, mp.PlayerId })
            .IsUnique();

        modelBuilder.Entity<Goal>()
            .HasOne(g => g.Match)
            .WithMany(m => m.Goals)
            .HasForeignKey(g => g.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Goal>()
            .HasOne(g => g.Player)
            .WithMany()
            .HasForeignKey(g => g.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Goal>()
            .HasOne(g => g.AsistenciaPlayer)
            .WithMany()
            .HasForeignKey(g => g.AsistenciaPlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Card>()
            .HasOne(c => c.Match)
            .WithMany(m => m.Cards)
            .HasForeignKey(c => c.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Card>()
            .HasOne(c => c.Player)
            .WithMany()
            .HasForeignKey(c => c.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ScheduledMatch>()
            .HasOne(sm => sm.CreadoPorUser)
            .WithMany(u => u.ScheduledMatchesCreated)
            .HasForeignKey(sm => sm.CreadoPorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ScheduledMatch>()
            .Property(sm => sm.Fecha)
            .HasColumnType("timestamp without time zone");

        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.ScheduledMatch)
            .WithMany(sm => sm.Attendances)
            .HasForeignKey(a => a.ScheduledMatchId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Attendance>()
            .HasOne(a => a.Player)
            .WithMany()
            .HasForeignKey(a => a.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Attendance>()
            .HasIndex(a => new { a.ScheduledMatchId, a.PlayerId })
            .IsUnique();
    }
}
