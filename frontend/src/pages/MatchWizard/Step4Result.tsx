import { Button } from "../../components/common/Button"
import { Card } from "../../components/common/Card"
import type { GoalType, PlayerListDto, Team } from "../../types"
import { newRowKey, type GoalRow, type WizardState } from "./wizardState"

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "Normal", label: "Gol" },
  { value: "Penal", label: "Penal" },
  { value: "TiroLibre", label: "Tiro libre" },
  { value: "EnContra", label: "En contra" },
]

function teamPlayers(state: WizardState, players: PlayerListDto[], team: Team) {
  const ids = team === "A" ? state.teamAIds : state.teamBIds
  return ids.map((id) => players.find((p) => p.id === id)).filter((p): p is PlayerListDto => !!p)
}

export function Step4Result({
  state,
  update,
  players,
}: {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
  players: PlayerListDto[]
}) {
  const playerTeam = (playerId: number): Team => (state.teamAIds.includes(playerId) ? "A" : "B")

  const addGoal = () => {
    update({
      goles: [
        ...state.goles,
        { key: newRowKey(), playerId: null, equipo: "A", minuto: "", tipo: "Normal", asistenciaPlayerId: null },
      ],
    })
  }

  const updateGoal = (key: string, patch: Partial<GoalRow>) => {
    update({ goles: state.goles.map((g) => (g.key === key ? { ...g, ...patch } : g)) })
  }

  const removeGoal = (key: string) => {
    update({ goles: state.goles.filter((g) => g.key !== key) })
  }

  const golesCargadosA = state.goles.filter((g) => g.equipo === "A" && g.tipo !== "EnContra").length
  const golesCargadosB = state.goles.filter((g) => g.equipo === "B" && g.tipo !== "EnContra").length
  const mismatch = golesCargadosA !== state.golesEquipoA || golesCargadosB !== state.golesEquipoB

  const allTeamPlayers = [...teamPlayers(state, players, "A"), ...teamPlayers(state, players, "B")]

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-cancha-700">Equipo A</span>
          <input
            type="number"
            min={0}
            value={state.golesEquipoA}
            onChange={(e) => update({ golesEquipoA: Number(e.target.value) })}
            className="w-16 rounded-xl border border-cancha-200 px-2 py-2 text-center text-2xl font-bold"
          />
        </div>
        <span className="text-xl font-bold text-cancha-950/40">-</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-acento-600">Equipo B</span>
          <input
            type="number"
            min={0}
            value={state.golesEquipoB}
            onChange={(e) => update({ golesEquipoB: Number(e.target.value) })}
            className="w-16 rounded-xl border border-cancha-200 px-2 py-2 text-center text-2xl font-bold"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-cancha-900">Goles y asistencias</h3>
        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={addGoal} disabled={allTeamPlayers.length === 0}>
          + Agregar gol
        </Button>
      </div>

      {mismatch && (
        <p className="text-sm text-acento-600">
          Cargaste {golesCargadosA} gol(es) de A y {golesCargadosB} de B, pero el resultado dice {state.golesEquipoA}-
          {state.golesEquipoB}. Podés dejarlo así si no cargaste todos los goles en detalle.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {state.goles.map((goal) => {
          const scorerTeam = goal.playerId ? playerTeam(goal.playerId) : "A"
          const teammates = teamPlayers(state, players, scorerTeam).filter((p) => p.id !== goal.playerId)

          return (
            <li key={goal.key}>
              <Card className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <select
                    value={goal.playerId ?? ""}
                    onChange={(e) => {
                      const playerId = e.target.value ? Number(e.target.value) : null
                      updateGoal(goal.key, {
                        playerId,
                        equipo: playerId ? playerTeam(playerId) : goal.equipo,
                        asistenciaPlayerId: null,
                      })
                    }}
                    className="flex-1 rounded-xl border border-cancha-200 px-2 py-2 text-sm"
                  >
                    <option value="">Jugador...</option>
                    {allTeamPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{playerTeam(p.id)}] {p.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal.key)}
                    className="rounded-lg px-2 text-cancha-950/40 hover:bg-red-50 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={goal.tipo}
                    onChange={(e) => updateGoal(goal.key, { tipo: e.target.value as GoalType })}
                    className="flex-1 rounded-xl border border-cancha-200 px-2 py-2 text-sm"
                  >
                    {GOAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    placeholder="Min."
                    value={goal.minuto}
                    onChange={(e) => updateGoal(goal.key, { minuto: e.target.value })}
                    className="w-20 rounded-xl border border-cancha-200 px-2 py-2 text-sm"
                  />
                </div>

                {goal.tipo !== "EnContra" && teammates.length > 0 && (
                  <select
                    value={goal.asistenciaPlayerId ?? ""}
                    onChange={(e) =>
                      updateGoal(goal.key, { asistenciaPlayerId: e.target.value ? Number(e.target.value) : null })
                    }
                    className="rounded-xl border border-cancha-200 px-2 py-2 text-sm"
                  >
                    <option value="">Sin asistencia</option>
                    {teammates.map((p) => (
                      <option key={p.id} value={p.id}>
                        Asistencia: {p.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
