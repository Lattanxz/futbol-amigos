import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deleteScheduledMatch, getScheduledMatch, setAttendance, updateScheduledMatch } from "../../api/scheduledMatches"
import { useAuth } from "../../auth/AuthContext"
import { Button } from "../../components/common/Button"
import { Card } from "../../components/common/Card"
import { Modal } from "../../components/common/Modal"
import { TextField } from "../../components/common/TextField"
import { attendanceSummary } from "../../lib/attendance"
import { formatFechaLarga, formatHora } from "../../lib/date"
import {
  emptyScheduledMatchForm,
  scheduledMatchFormFromDetail,
  scheduledMatchFormToPayload,
} from "./scheduledMatchForm"
import type { AttendanceStatus, ScheduledMatchDetailDto } from "../../types/scheduledMatch"

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  Va: "Va",
  Duda: "Duda",
  No: "No",
}

const STATUS_CLASSES: Record<AttendanceStatus, string> = {
  Va: "bg-cancha-700 text-white",
  Duda: "bg-acento-500 text-white",
  No: "bg-red-600 text-white",
}

export function ScheduledMatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [match, setMatch] = useState<ScheduledMatchDetailDto | null>(null)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyScheduledMatchForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = (matchId: number) => getScheduledMatch(matchId).then(setMatch)

  useEffect(() => {
    if (id) load(Number(id))
  }, [id])

  if (!match) return <p className="text-cancha-950/60">Cargando...</p>

  const isOwner = match.creadoPorUserId === user?.id
  const cantidadVa = match.roster.filter((r) => r.estado === "Va").length
  const cupoSuperado = match.cupoMaximo !== null && cantidadVa > match.cupoMaximo

  const startEditing = () => {
    setForm(scheduledMatchFormFromDetail(match))
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.fecha || !form.lugar.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateScheduledMatch(match.id, scheduledMatchFormToPayload(form))
      setMatch(updated)
      setEditing(false)
    } catch {
      setSaveError("No se pudo guardar los cambios.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteScheduledMatch(match.id)
      navigate("/proximos", { replace: true })
    } catch {
      setDeleting(false)
    }
  }

  const handleSetAttendance = async (playerId: number, estado: AttendanceStatus) => {
    const previous = match
    setMatch({
      ...match,
      roster: match.roster.map((r) => (r.playerId === playerId ? { ...r, estado } : r)),
    })
    try {
      await setAttendance(match.id, playerId, { estado })
    } catch {
      setMatch(previous)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="capitalize font-semibold text-cancha-950">
          {formatFechaLarga(match.fecha)} · {formatHora(match.fecha)}
        </p>
        <p className="text-sm text-cancha-950/60">{match.lugar}</p>
        {match.cupoMaximo !== null && (
          <p className="text-sm text-cancha-950/60">Cupo: {match.cupoMaximo} jugadores</p>
        )}
        {match.notas && <p className="mt-1 text-sm text-cancha-950/70">{match.notas}</p>}
        <p className="mt-2 text-sm font-medium text-cancha-800">{attendanceSummary({
          totalJugadores: match.roster.length,
          cantidadVa,
          cantidadDuda: match.roster.filter((r) => r.estado === "Duda").length,
          cantidadNo: match.roster.filter((r) => r.estado === "No").length,
        })}</p>
        {cupoSuperado && (
          <p className="mt-1 text-sm font-semibold text-red-600">
            Cupo superado por {cantidadVa - (match.cupoMaximo ?? 0)}
          </p>
        )}
        <p className="mt-2 text-xs text-cancha-950/40">Programado por {match.creadoPorNombre}</p>
      </Card>

      {isOwner && (
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 border border-cancha-200" onClick={startEditing}>
            Editar
          </Button>
          <Button
            variant="ghost"
            className="flex-1 border border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setConfirmingDelete(true)}
          >
            Eliminar
          </Button>
        </div>
      )}

      {editing && (
        <Card>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <TextField
              label="Fecha y hora"
              name="fecha"
              type="datetime-local"
              value={form.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              required
            />
            <TextField
              label="Cancha / lugar"
              name="lugar"
              value={form.lugar}
              onChange={(e) => setForm((f) => ({ ...f, lugar: e.target.value }))}
              required
            />
            <TextField
              label="Cupo máximo (opcional)"
              name="cupoMaximo"
              type="number"
              min={1}
              value={form.cupoMaximo}
              onChange={(e) => setForm((f) => ({ ...f, cupoMaximo: e.target.value }))}
            />
            <TextField
              label="Notas (opcional)"
              name="notas"
              value={form.notas}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            />
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button type="button" variant="ghost" className="border border-cancha-200" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="mb-2 font-semibold text-cancha-900">Quién viene</h2>
        <ul className="flex flex-col gap-2">
          {match.roster.map((r) => (
            <li key={r.playerId} className="flex items-center gap-3 rounded-xl border border-cancha-100 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cancha-950">
                  {r.nombre} {r.apodo && <span className="text-cancha-950/50">"{r.apodo}"</span>}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => handleSetAttendance(r.playerId, estado)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      r.estado === estado ? STATUS_CLASSES[estado] : "bg-cancha-50 text-cancha-700"
                    }`}
                  >
                    {STATUS_LABEL[estado]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Eliminar partido programado">
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
