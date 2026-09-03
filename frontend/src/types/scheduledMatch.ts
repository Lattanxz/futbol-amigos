export type AttendanceStatus = "Va" | "Duda" | "No"

export interface ScheduledMatchUpsertRequest {
  fecha: string
  lugar: string
  cupoMaximo?: number | null
  notas?: string | null
}

export interface AttendanceUpsertRequest {
  estado: AttendanceStatus
}

export interface AttendanceRosterDto {
  playerId: number
  nombre: string
  apodo: string | null
  estado: AttendanceStatus | null
  actualizadoEn: string | null
}

export interface ScheduledMatchListDto {
  id: number
  fecha: string
  lugar: string
  cupoMaximo: number | null
  creadoPorUserId: number
  creadoPorNombre: string
  totalJugadores: number
  cantidadVa: number
  cantidadDuda: number
  cantidadNo: number
}

export interface ScheduledMatchDetailDto {
  id: number
  fecha: string
  lugar: string
  cupoMaximo: number | null
  notas: string | null
  creadoPorUserId: number
  creadoPorNombre: string
  roster: AttendanceRosterDto[]
}
