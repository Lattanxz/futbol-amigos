import { FORMATIONS } from "./FormationSlots"

export interface PitchPlayer {
  id: number
  nombre: string
  apodo: string | null
}

export function Pitch({
  formacion,
  assignments,
  players,
  onSlotClick,
  readOnly = false,
}: {
  formacion: string
  assignments: Record<string, number>
  players: PitchPlayer[]
  onSlotClick?: (slotKey: string) => void
  readOnly?: boolean
}) {
  const slots = FORMATIONS[formacion] ?? []
  const playerById = new Map(players.map((p) => [p.id, p]))

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("")

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-cancha-600">
      {/* field markings */}
      <div className="pointer-events-none absolute inset-2 rounded-lg border-2 border-white/40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t-2 border-white/40" />
      <div className="pointer-events-none absolute inset-x-[25%] top-2 h-10 rounded-b-lg border-2 border-t-0 border-white/40" />
      <div className="pointer-events-none absolute inset-x-[25%] bottom-2 h-10 rounded-t-lg border-2 border-b-0 border-white/40" />

      {slots.map((slot) => {
        const playerId = assignments[slot.key]
        const player = playerId ? playerById.get(playerId) : undefined

        return (
          <button
            key={slot.key}
            type="button"
            disabled={readOnly}
            onClick={() => onSlotClick?.(slot.key)}
            style={{ left: `${slot.xPct}%`, top: `${slot.yPct}%` }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 disabled:pointer-events-none"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold shadow ${
                player
                  ? "border-acento-500 bg-white text-cancha-900"
                  : "border-white/70 bg-cancha-700/60 text-white/80"
              }`}
            >
              {player ? initials(player.nombre) : "+"}
            </span>
            <span className="max-w-16 truncate rounded bg-black/30 px-1 text-[10px] font-medium text-white">
              {player ? player.apodo ?? player.nombre.split(" ")[0] : slot.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
