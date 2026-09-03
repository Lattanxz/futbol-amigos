export type Team = "A" | "B"
export type GoalType = "Normal" | "Penal" | "TiroLibre" | "EnContra"
export type CardType = "Amarilla" | "Roja"

export interface UserDto {
  id: number
  nombre: string
  email: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: UserDto
}

export interface PlayerListDto {
  id: number
  nombre: string
  apodo: string | null
  fotoUrl: string | null
  posicionHabitual: string | null
}

export interface PlayerDetailDto extends PlayerListDto {
  partidosJugados: number
  goles: number
  asistencias: number
  victorias: number
  empates: number
  derrotas: number
  porcentajeVictorias: number
}

export interface PlayerUpsertRequest {
  nombre: string
  apodo?: string | null
  fotoUrl?: string | null
  posicionHabitual?: string | null
  userId?: number | null
}

export interface MatchPlayerRequest {
  playerId: number
  posicionSlot: string
}

export interface MatchTeamRequest {
  equipo: Team
  formacion: string
  jugadores: MatchPlayerRequest[]
}

export interface GoalRequest {
  playerId: number
  equipo: Team
  minuto?: number | null
  tipo: GoalType
  asistenciaPlayerId?: number | null
}

export interface CardRequest {
  playerId: number
  tipo: CardType
  minuto?: number | null
}

export interface MatchUpsertRequest {
  fecha: string
  lugar: string
  equipos: MatchTeamRequest[]
  golesEquipoA: number
  golesEquipoB: number
  goles: GoalRequest[]
  tarjetas: CardRequest[]
}

export interface MatchListDto {
  id: number
  fecha: string
  lugar: string
  golesEquipoA: number
  golesEquipoB: number
  creadoPorUserId: number
  creadoPorNombre: string
}

export interface MatchPlayerDto {
  playerId: number
  nombre: string
  apodo: string | null
  posicionSlot: string
}

export interface MatchTeamDto {
  equipo: Team
  formacion: string
  jugadores: MatchPlayerDto[]
}

export interface GoalDto {
  id: number
  playerId: number
  nombreJugador: string
  equipo: Team
  minuto: number | null
  tipo: GoalType
  asistenciaPlayerId: number | null
  asistenciaNombre: string | null
}

export interface CardDto {
  id: number
  playerId: number
  nombreJugador: string
  tipo: CardType
  minuto: number | null
}

export interface MatchDetailDto {
  id: number
  fecha: string
  lugar: string
  golesEquipoA: number
  golesEquipoB: number
  creadoPorUserId: number
  creadoPorNombre: string
  equipos: MatchTeamDto[]
  goles: GoalDto[]
  tarjetas: CardDto[]
}
