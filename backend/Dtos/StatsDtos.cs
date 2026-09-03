namespace FutbolAmigos.Api.Dtos;

public record RankingEntryDto(int PlayerId, string Nombre, string? Apodo, double Valor);

public record RankingDto(
    List<RankingEntryDto> Goleadores,
    List<RankingEntryDto> MasPartidos,
    List<RankingEntryDto> MasAsistencias,
    List<RankingEntryDto> MejorPorcentajeVictorias);
