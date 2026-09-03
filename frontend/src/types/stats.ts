export interface RankingEntryDto {
  playerId: number
  nombre: string
  apodo: string | null
  valor: number
}

export interface RankingDto {
  goleadores: RankingEntryDto[]
  masPartidos: RankingEntryDto[]
  masAsistencias: RankingEntryDto[]
  mejorPorcentajeVictorias: RankingEntryDto[]
}
