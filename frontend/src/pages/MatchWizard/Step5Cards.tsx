import { Button } from "../../components/common/Button"
import { Card } from "../../components/common/Card"
import { EmptyState } from "../../components/common/EmptyState"
import type { CardType, PlayerListDto } from "../../types"
import { newRowKey, type CardRow, type WizardState } from "./wizardState"

export function Step5Cards({
  state,
  update,
  players,
}: {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
  players: PlayerListDto[]
}) {
  const allTeamIds = [...state.teamAIds, ...state.teamBIds]
  const allTeamPlayers = allTeamIds.map((id) => players.find((p) => p.id === id)).filter((p): p is PlayerListDto => !!p)

  const addCard = () => {
    update({ tarjetas: [...state.tarjetas, { key: newRowKey(), playerId: null, tipo: "Amarilla", minuto: "" }] })
  }

  const updateCard = (key: string, patch: Partial<CardRow>) => {
    update({ tarjetas: state.tarjetas.map((c) => (c.key === key ? { ...c, ...patch } : c)) })
  }

  const removeCard = (key: string) => {
    update({ tarjetas: state.tarjetas.filter((c) => c.key !== key) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-cancha-900">Tarjetas (opcional)</h3>
        <Button variant="ghost" className="border border-cancha-200 px-3 py-1.5 text-xs" onClick={addCard}>
          + Agregar tarjeta
        </Button>
      </div>

      {state.tarjetas.length === 0 && (
        <EmptyState title="Sin tarjetas" description="Podés saltear este paso si no hubo amonestados." />
      )}

      <ul className="flex flex-col gap-3">
        {state.tarjetas.map((card) => (
          <li key={card.key}>
            <Card className="flex flex-col gap-2">
              <div className="flex gap-2">
                <select
                  value={card.playerId ?? ""}
                  onChange={(e) => updateCard(card.key, { playerId: e.target.value ? Number(e.target.value) : null })}
                  className="flex-1 rounded-xl border border-cancha-200 px-2 py-2 text-sm"
                >
                  <option value="">Jugador...</option>
                  {allTeamPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeCard(card.key)}
                  className="rounded-lg px-2 text-cancha-950/40 hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={card.tipo}
                  onChange={(e) => updateCard(card.key, { tipo: e.target.value as CardType })}
                  className="flex-1 rounded-xl border border-cancha-200 px-2 py-2 text-sm"
                >
                  <option value="Amarilla">Amarilla</option>
                  <option value="Roja">Roja</option>
                </select>
                <input
                  type="number"
                  min={0}
                  max={200}
                  placeholder="Min."
                  value={card.minuto}
                  onChange={(e) => updateCard(card.key, { minuto: e.target.value })}
                  className="w-20 rounded-xl border border-cancha-200 px-2 py-2 text-sm"
                />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
