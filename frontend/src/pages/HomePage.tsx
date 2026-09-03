import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getMatches } from "../api/matches"
import { useAuth } from "../auth/AuthContext"
import { Button } from "../components/common/Button"
import { Card } from "../components/common/Card"
import type { MatchListDto } from "../types"

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
}

export function HomePage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchListDto[] | null>(null)

  useEffect(() => {
    getMatches().then((all) => setMatches(all.slice(0, 3)))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-cancha-800 bg-cancha-800 text-white">
        <p className="text-sm text-cancha-100">Hola, {user?.nombre}</p>
        <h1 className="text-xl font-bold">¿Listos para el próximo partido?</h1>
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
                    {formatFecha(m.fecha)} · {m.lugar}
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
