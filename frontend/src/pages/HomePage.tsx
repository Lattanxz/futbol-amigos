import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getMatches } from "../api/matches"
import { getScheduledMatches } from "../api/scheduledMatches"
import { useAuth } from "../auth/AuthContext"
import { Button } from "../components/common/Button"
import { Card } from "../components/common/Card"
import { attendanceSummary } from "../lib/attendance"
import { formatFechaCorta, formatFechaLarga, formatHora } from "../lib/date"
import type { MatchListDto } from "../types"
import type { ScheduledMatchListDto } from "../types/scheduledMatch"

export function HomePage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchListDto[] | null>(null)
  const [nextMatch, setNextMatch] = useState<ScheduledMatchListDto | null | undefined>(undefined)

  useEffect(() => {
    getMatches().then((all) => setMatches(all.slice(0, 3)))
  }, [])

  useEffect(() => {
    getScheduledMatches().then((all) => setNextMatch(all[0] ?? null))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-cancha-800 bg-cancha-800 text-white">
        <p className="text-sm text-cancha-100">Hola, {user?.nombre}</p>
        <h1 className="text-xl font-bold">¿Listos para el próximo partido?</h1>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-cancha-900">Próximo partido</h2>
          <Link to="/proximos" className="text-xs font-medium text-cancha-700 hover:underline">
            Ver todos
          </Link>
        </div>

        {nextMatch === undefined && <p className="text-sm text-cancha-950/60">Cargando...</p>}

        {nextMatch === null && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-cancha-950/60">Todavía no hay ningún partido programado.</p>
            <Link to="/proximos" className="text-sm font-medium text-cancha-700 hover:underline">
              Programar uno →
            </Link>
          </div>
        )}

        {nextMatch && (
          <Link to={`/proximos/${nextMatch.id}`} className="flex flex-col gap-1 rounded-lg hover:bg-cancha-50">
            <p className="font-semibold capitalize text-cancha-950">
              {formatFechaLarga(nextMatch.fecha)} · {formatHora(nextMatch.fecha)}
            </p>
            <p className="text-sm text-cancha-950/60">{nextMatch.lugar}</p>
            <p className="text-sm text-cancha-950/60">{attendanceSummary(nextMatch)}</p>
          </Link>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/partidos/nuevo">
          <Button variant="secondary" className="w-full">
            ⚽ Cargar partido
          </Button>
        </Link>
        <Link to="/ranking">
          <Button variant="ghost" className="w-full border border-cancha-200">
            🏆 Ver ranking
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-cancha-900">Últimos resultados</h2>
          {matches && matches.length > 0 && (
            <Link to="/partidos" className="text-xs font-medium text-cancha-700 hover:underline">
              Ver todos
            </Link>
          )}
        </div>

        {matches === null && <p className="text-sm text-cancha-950/60">Cargando...</p>}

        {matches !== null && matches.length === 0 && (
          <p className="text-sm text-cancha-950/60">
            Todavía no hay partidos cargados. Cuando carguen el primero, va a aparecer acá.
          </p>
        )}

        {matches !== null && matches.length > 0 && (
          <ul className="flex flex-col gap-2">
            {matches.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/partidos/${m.id}`}
                  className="flex items-center justify-between rounded-lg px-1 py-1.5 hover:bg-cancha-50"
                >
                  <span className="text-sm text-cancha-950/70">
                    {formatFechaCorta(m.fecha)} · {m.lugar}
                  </span>
                  <span className="font-bold text-cancha-900">
                    {m.golesEquipoA} - {m.golesEquipoB}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
