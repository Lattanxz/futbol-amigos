import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { deleteMatch, getMatch } from "../api/matches"
import { useAuth } from "../auth/AuthContext"
import { Button } from "../components/common/Button"
import { Card } from "../components/common/Card"
import { Modal } from "../components/common/Modal"
import { Pitch } from "../components/pitch/Pitch"
import type { MatchDetailDto } from "../types"

const GOAL_TYPE_LABEL: Record<string, string> = {
  Normal: "",
  Penal: "(penal)",
  TiroLibre: "(tiro libre)",
  EnContra: "(en contra)",
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [match, setMatch] = useState<MatchDetailDto | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) getMatch(Number(id)).then(setMatch)
  }, [id])

  if (!match) return <p className="text-cancha-950/60">Cargando...</p>

  const teamA = match.equipos.find((e) => e.equipo === "A")
  const teamB = match.equipos.find((e) => e.equipo === "B")
  const isOwner = match.creadoPorUserId === user?.id

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMatch(match.id)
      navigate("/partidos", { replace: true })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm capitalize text-cancha-950/60">{formatFecha(match.fecha)}</p>
        <p className="text-sm text-cancha-950/60">{match.lugar}</p>
        <div className="mt-2 flex items-center justify-center gap-6">
          <span className="text-3xl font-bold text-cancha-700">{match.golesEquipoA}</span>
          <span className="text-cancha-950/40">-</span>
          <span className="text-3xl font-bold text-acento-600">{match.golesEquipoB}</span>
        </div>
        <p className="mt-2 text-center text-xs text-cancha-950/40">Cargado por {match.creadoPorNombre}</p>
      </Card>

      {isOwner && (
        <div className="flex gap-2">
          <Link to={`/partidos/${match.id}/editar`} className="flex-1">
            <Button variant="ghost" className="w-full border border-cancha-200">
              Editar
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="flex-1 border border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setConfirmingDelete(true)}
          >
            Eliminar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {teamA && (
          <div>
            <p className="mb-2 text-sm font-semibold text-cancha-700">Equipo A · {teamA.formacion}</p>
            <Pitch
              formacion={teamA.formacion}
              assignments={Object.fromEntries(teamA.jugadores.map((j) => [j.posicionSlot, j.playerId]))}
              players={teamA.jugadores.map((j) => ({ id: j.playerId, nombre: j.nombre, apodo: j.apodo }))}
              readOnly
            />
          </div>
        )}
        {teamB && (
          <div>
            <p className="mb-2 text-sm font-semibold text-acento-600">Equipo B · {teamB.formacion}</p>
            <Pitch
              formacion={teamB.formacion}
              assignments={Object.fromEntries(teamB.jugadores.map((j) => [j.posicionSlot, j.playerId]))}
              players={teamB.jugadores.map((j) => ({ id: j.playerId, nombre: j.nombre, apodo: j.apodo }))}
              readOnly
            />
          </div>
        )}
      </div>

      <Card>
        <h2 className="mb-2 font-semibold text-cancha-900">Goles</h2>
        {match.goles.length === 0 ? (
          <p className="text-sm text-cancha-950/60">No se cargaron goles en detalle.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm">
            {match.goles.map((g) => (
              <li key={g.id} className="flex items-center justify-between">
                <span>
                  ⚽ {g.nombreJugador} <span className="text-cancha-950/50">{GOAL_TYPE_LABEL[g.tipo]}</span>
                  {g.asistenciaNombre && (
                    <span className="text-cancha-950/50"> · asist. {g.asistenciaNombre}</span>
                  )}
                </span>
                {g.minuto !== null && <span className="text-cancha-950/40">{g.minuto}'</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {match.tarjetas.length > 0 && (
        <Card>
          <h2 className="mb-2 font-semibold text-cancha-900">Tarjetas</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {match.tarjetas.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span>
                  {c.tipo === "Amarilla" ? "🟨" : "🟥"} {c.nombreJugador}
                </span>
                {c.minuto !== null && <span className="text-cancha-950/40">{c.minuto}'</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Eliminar partido">
        <p className="text-sm text-cancha-950/70">Esta acción no se puede deshacer.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="danger" disabled={deleting} onClick={handleDelete} className="flex-1">
            {deleting ? "Eliminando..." : "Sí, eliminar"}
          </Button>
          <Button variant="ghost" className="border border-cancha-200" onClick={() => setConfirmingDelete(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
