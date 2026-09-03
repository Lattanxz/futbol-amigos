import { useState } from "react"
import { Modal } from "../../components/common/Modal"
import { FORMATION_GROUPS, formationCapacity } from "../../components/pitch/FormationSlots"
import { Pitch } from "../../components/pitch/Pitch"
import type { PlayerListDto, Team } from "../../types"
import type { WizardState } from "./wizardState"

function TeamFormationEditor({
  team,
  label,
  formacion,
  slots,
  roster,
  players,
  onFormacionChange,
  onSlotAssign,
}: {
  team: Team
  label: string
  formacion: string
  slots: Record<string, number>
  roster: number[]
  players: PlayerListDto[]
  onFormacionChange: (formacion: string) => void
  onSlotAssign: (slotKey: string, playerId: number | null) => void
}) {
  const [pickingSlot, setPickingSlot] = useState<string | null>(null)

  const rosterPlayers = roster.map((id) => players.find((p) => p.id === id)).filter((p): p is PlayerListDto => !!p)
  const assignedIds = new Set(Object.values(slots))
  const unassigned = rosterPlayers.filter((p) => !assignedIds.has(p.id))
  const capacity = formationCapacity(formacion)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-cancha-900">
          Equipo {team} <span className="font-normal text-cancha-950/60">({label})</span>
        </h3>
        <span className="text-xs font-medium text-cancha-950/60">
          {assignedIds.size}/{roster.length} asignados
        </span>
      </div>

      <select
        value={formacion}
        onChange={(e) => onFormacionChange(e.target.value)}
        className="rounded-xl border border-cancha-200 bg-white px-3 py-2 text-sm font-medium"
      >
        {FORMATION_GROUPS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.formaciones.map((f) => (
              <option key={f} value={f}>
                {f} ({formationCapacity(f)} jugadores)
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {roster.length > capacity && (
        <p className="text-sm text-red-600">
          Elegiste {roster.length} jugadores pero esta formación tiene lugar para {capacity}. Sacá jugadores o elegí
          una formación más grande.
        </p>
      )}

      <Pitch
        formacion={formacion}
        assignments={slots}
        players={rosterPlayers}
        onSlotClick={(slotKey) => setPickingSlot(slotKey)}
      />

      {unassigned.length > 0 && (
        <p className="text-xs text-cancha-950/60">Sin asignar: {unassigned.map((p) => p.apodo ?? p.nombre).join(", ")}</p>
      )}

      <Modal open={pickingSlot !== null} onClose={() => setPickingSlot(null)} title={`Posición ${pickingSlot ?? ""}`}>
        <ul className="flex flex-col gap-1">
          {slots[pickingSlot ?? ""] && (
            <li>
              <button
                type="button"
                onClick={() => {
                  onSlotAssign(pickingSlot!, null)
                  setPickingSlot(null)
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Dejar vacío
              </button>
            </li>
          )}
          {unassigned.length === 0 && !slots[pickingSlot ?? ""] && (
            <p className="px-3 py-2 text-sm text-cancha-950/60">
              No quedan jugadores sin asignar en este equipo.
            </p>
          )}
          {unassigned.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onSlotAssign(pickingSlot!, p.id)
                  setPickingSlot(null)
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-cancha-950 hover:bg-cancha-50"
              >
                {p.nombre} {p.apodo && <span className="text-cancha-950/50">"{p.apodo}"</span>}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  )
}

export function Step3Formations({
  state,
  update,
  players,
}: {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
  players: PlayerListDto[]
}) {
  const assignSlot = (team: Team, slotKey: string, playerId: number | null) => {
    const key = team === "A" ? "slotsA" : "slotsB"
    const next = { ...state[key] }
    if (playerId === null) {
      delete next[slotKey]
    } else {
      next[slotKey] = playerId
    }
    update({ [key]: next } as Partial<WizardState>)
  }

  return (
    <div className="flex flex-col gap-8">
      {state.teamAIds.length === 0 && state.teamBIds.length === 0 ? (
        <p className="text-sm text-cancha-950/60">Volvé al paso anterior y elegí jugadores para cada equipo.</p>
      ) : (
        <>
          <TeamFormationEditor
            team="A"
            label="tu selección"
            formacion={state.formacionA}
            slots={state.slotsA}
            roster={state.teamAIds}
            players={players}
            onFormacionChange={(f) => update({ formacionA: f })}
            onSlotAssign={(slot, pid) => assignSlot("A", slot, pid)}
          />
          <TeamFormationEditor
            team="B"
            label="tu selección"
            formacion={state.formacionB}
            slots={state.slotsB}
            roster={state.teamBIds}
            players={players}
            onFormacionChange={(f) => update({ formacionB: f })}
            onSlotAssign={(slot, pid) => assignSlot("B", slot, pid)}
          />
        </>
      )}
    </div>
  )
}

export function isFormationsStepComplete(state: WizardState): boolean {
  const aOk =
    state.teamAIds.length === 0 ||
    (state.teamAIds.length <= formationCapacity(state.formacionA) &&
      state.teamAIds.every((id) => Object.values(state.slotsA).includes(id)))
  const bOk =
    state.teamBIds.length === 0 ||
    (state.teamBIds.length <= formationCapacity(state.formacionB) &&
      state.teamBIds.every((id) => Object.values(state.slotsB).includes(id)))
  return aOk && bOk && (state.teamAIds.length > 0 || state.teamBIds.length > 0)
}
