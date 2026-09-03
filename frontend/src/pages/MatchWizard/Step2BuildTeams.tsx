import type { PlayerListDto } from "../../types"
import type { WizardState } from "./wizardState"

export function Step2BuildTeams({
  state,
  update,
  players,
}: {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
  players: PlayerListDto[]
}) {
  const teamOf = (playerId: number): "A" | "B" | null => {
    if (state.teamAIds.includes(playerId)) return "A"
    if (state.teamBIds.includes(playerId)) return "B"
    return null
  }

  const setTeam = (playerId: number, team: "A" | "B" | null) => {
    const teamAIds = state.teamAIds.filter((id) => id !== playerId)
    const teamBIds = state.teamBIds.filter((id) => id !== playerId)
    const slotsA = Object.fromEntries(Object.entries(state.slotsA).filter(([, id]) => id !== playerId))
    const slotsB = Object.fromEntries(Object.entries(state.slotsB).filter(([, id]) => id !== playerId))

    if (team === "A") teamAIds.push(playerId)
    if (team === "B") teamBIds.push(playerId)

    update({ teamAIds, teamBIds, slotsA, slotsB })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 text-sm font-semibold">
        <span className="text-cancha-700">Equipo A: {state.teamAIds.length}</span>
        <span className="text-acento-600">Equipo B: {state.teamBIds.length}</span>
      </div>

      <ul className="flex flex-col gap-2">
        {players.map((p) => {
          const current = teamOf(p.id)
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-cancha-100 bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cancha-950">
                  {p.nombre} {p.apodo && <span className="text-cancha-950/50">"{p.apodo}"</span>}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setTeam(p.id, current === "A" ? null : "A")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    current === "A" ? "bg-cancha-700 text-white" : "bg-cancha-50 text-cancha-700"
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setTeam(p.id, current === "B" ? null : "B")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    current === "B" ? "bg-acento-500 text-white" : "bg-acento-500/10 text-acento-600"
                  }`}
                >
                  B
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {players.length === 0 && (
        <p className="text-sm text-cancha-950/60">No hay jugadores cargados todavía. Agregalos en "Jugadores".</p>
      )}
    </div>
  )
}
