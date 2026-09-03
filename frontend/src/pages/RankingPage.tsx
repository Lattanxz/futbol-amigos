import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getRanking } from "../api/stats"
import { Card } from "../components/common/Card"
import { EmptyState } from "../components/common/EmptyState"
import type { RankingDto, RankingEntryDto } from "../types/stats"

const MEDALS = ["🥇", "🥈", "🥉"]

function RankingList({ title, entries, suffix = "" }: { title: string; entries: RankingEntryDto[]; suffix?: string }) {
  return (
    <Card>
      <h2 className="mb-3 font-semibold text-cancha-900">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-cancha-950/60">Todavía no hay datos.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {entries.map((e, i) => (
            <li key={e.playerId}>
              <Link
                to={`/jugadores/${e.playerId}`}
                className="flex items-center justify-between rounded-lg px-1 py-1 hover:bg-cancha-50"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-cancha-950">
                  <span className="w-6 text-center">{MEDALS[i] ?? i + 1}</span>
                  {e.nombre} {e.apodo && <span className="text-cancha-950/50">"{e.apodo}"</span>}
                </span>
                <span className="font-bold text-cancha-800">
                  {e.valor}
                  {suffix}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

export function RankingPage() {
  const [ranking, setRanking] = useState<RankingDto | null>(null)

  useEffect(() => {
    getRanking().then(setRanking)
  }, [])

  if (!ranking) return <p className="text-cancha-950/60">Cargando...</p>

  const isEmpty =
    ranking.goleadores.length === 0 &&
    ranking.masPartidos.length === 0 &&
    ranking.masAsistencias.length === 0 &&
    ranking.mejorPorcentajeVictorias.length === 0

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-cancha-900">Ranking del grupo</h1>

      {isEmpty ? (
        <EmptyState
          title="Todavía no hay partidos"
          description="Cuando carguen el primer partido, acá va a aparecer el ranking del grupo."
        />
      ) : (
        <>
          <RankingList title="⚽ Goleador histórico" entries={ranking.goleadores} />
          <RankingList title="🎯 Más asistencias" entries={ranking.masAsistencias} />
          <RankingList title="📅 Más partidos jugados" entries={ranking.masPartidos} />
          <RankingList title="🏆 Mejor % de victorias" entries={ranking.mejorPorcentajeVictorias} suffix="%" />
        </>
      )}
    </div>
  )
}
