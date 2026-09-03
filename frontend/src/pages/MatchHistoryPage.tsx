import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getMatches, type MatchFilters } from "../api/matches"
import { getPlayers } from "../api/players"
import { Card } from "../components/common/Card"
import { EmptyState } from "../components/common/EmptyState"
import { formatFechaConAnio } from "../lib/date"
import type { MatchListDto, PlayerListDto } from "../types"

export function MatchHistoryPage() {
  const [players, setPlayers] = useState<PlayerListDto[]>([])
  const [matches, setMatches] = useState<MatchListDto[] | null>(null)
  const [filters, setFilters] = useState<MatchFilters>({})

  useEffect(() => {
    getPlayers().then(setPlayers)
  }, [])

  useEffect(() => {
    getMatches(filters).then(setMatches)
  }, [filters])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-cancha-900">Historial de partidos</h1>

      <Card className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Cancha"
            value={filters.cancha ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, cancha: e.target.value || undefined }))}
            className="rounded-xl border border-cancha-200 px-3 py-2 text-sm"
          />
          <select
            value={filters.jugadorId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, jugadorId: e.target.value ? Number(e.target.value) : undefined }))
            }
            className="rounded-xl border border-cancha-200 px-3 py-2 text-sm"
          >
            <option value="">Todos los jugadores</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.desde ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, desde: e.target.value || undefined }))}
            className="rounded-xl border border-cancha-200 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.hasta ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, hasta: e.target.value || undefined }))}
            className="rounded-xl border border-cancha-200 px-3 py-2 text-sm"
          />
        </div>
      </Card>

      {matches === null && <p className="text-cancha-950/60">Cargando...</p>}

      {matches !== null && matches.length === 0 && (
        <EmptyState title="No hay partidos" description="Probá cambiar los filtros o cargá el primer partido." />
      )}

      {matches !== null && matches.length > 0 && (
        <ul className="flex flex-col gap-2">
          {matches.map((m) => (
            <li key={m.id}>
              <Link to={`/partidos/${m.id}`}>
                <Card className="flex items-center justify-between hover:border-cancha-300">
                  <div>
                    <p className="text-sm text-cancha-950/60">
                      {formatFechaConAnio(m.fecha)} · {m.lugar}
                    </p>
                    <p className="text-xs text-cancha-950/40">Cargado por {m.creadoPorNombre}</p>
                  </div>
                  <p className="text-xl font-bold text-cancha-900">
                    {m.golesEquipoA} - {m.golesEquipoB}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
