import type { CardType, GoalType, MatchDetailDto, MatchUpsertRequest, Team } from "../../types"

export interface GoalRow {
  key: string
  playerId: number | null
  equipo: Team
  minuto: string
  tipo: GoalType
  asistenciaPlayerId: number | null
}

export interface CardRow {
  key: string
  playerId: number | null
  tipo: CardType
  minuto: string
}

export interface WizardState {
  fecha: string
  lugar: string
  teamAIds: number[]
  teamBIds: number[]
  formacionA: string
  formacionB: string
  slotsA: Record<string, number>
  slotsB: Record<string, number>
  golesEquipoA: number
  golesEquipoB: number
  goles: GoalRow[]
  tarjetas: CardRow[]
}

let rowCounter = 0
export function newRowKey() {
  rowCounter += 1
  return `row-${rowCounter}-${Date.now()}`
}

export function emptyWizardState(): WizardState {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]
  const localIso = `${localDate}T20:00`

  return {
    fecha: localIso,
    lugar: "",
    teamAIds: [],
    teamBIds: [],
    formacionA: "2-2",
    formacionB: "2-2",
    slotsA: {},
    slotsB: {},
    golesEquipoA: 0,
    golesEquipoB: 0,
    goles: [],
    tarjetas: [],
  }
}

export function wizardStateFromMatch(match: MatchDetailDto): WizardState {
  const teamA = match.equipos.find((e) => e.equipo === "A")
  const teamB = match.equipos.find((e) => e.equipo === "B")

  const slotsA: Record<string, number> = {}
  teamA?.jugadores.forEach((j) => (slotsA[j.posicionSlot] = j.playerId))
  const slotsB: Record<string, number> = {}
  teamB?.jugadores.forEach((j) => (slotsB[j.posicionSlot] = j.playerId))

  return {
    fecha: match.fecha.slice(0, 16),
    lugar: match.lugar,
    teamAIds: teamA?.jugadores.map((j) => j.playerId) ?? [],
    teamBIds: teamB?.jugadores.map((j) => j.playerId) ?? [],
    formacionA: teamA?.formacion ?? "2-2",
    formacionB: teamB?.formacion ?? "2-2",
    slotsA,
    slotsB,
    golesEquipoA: match.golesEquipoA,
    golesEquipoB: match.golesEquipoB,
    goles: match.goles.map((g) => ({
      key: newRowKey(),
      playerId: g.playerId,
      equipo: g.equipo,
      minuto: g.minuto?.toString() ?? "",
      tipo: g.tipo,
      asistenciaPlayerId: g.asistenciaPlayerId,
    })),
    tarjetas: match.tarjetas.map((c) => ({
      key: newRowKey(),
      playerId: c.playerId,
      tipo: c.tipo,
      minuto: c.minuto?.toString() ?? "",
    })),
  }
}

export function wizardStateToPayload(state: WizardState): MatchUpsertRequest {
  return {
    fecha: state.fecha,
    lugar: state.lugar.trim(),
    equipos: [
      {
        equipo: "A",
        formacion: state.formacionA,
        jugadores: Object.entries(state.slotsA).map(([posicionSlot, playerId]) => ({ posicionSlot, playerId })),
      },
      {
        equipo: "B",
        formacion: state.formacionB,
        jugadores: Object.entries(state.slotsB).map(([posicionSlot, playerId]) => ({ posicionSlot, playerId })),
      },
    ],
    golesEquipoA: state.golesEquipoA,
    golesEquipoB: state.golesEquipoB,
    goles: state.goles
      .filter((g) => g.playerId !== null)
      .map((g) => ({
        playerId: g.playerId!,
        equipo: g.equipo,
        minuto: g.minuto ? Number(g.minuto) : null,
        tipo: g.tipo,
        asistenciaPlayerId: g.asistenciaPlayerId,
      })),
    tarjetas: state.tarjetas
      .filter((c) => c.playerId !== null)
      .map((c) => ({
        playerId: c.playerId!,
        tipo: c.tipo,
        minuto: c.minuto ? Number(c.minuto) : null,
      })),
  }
}
