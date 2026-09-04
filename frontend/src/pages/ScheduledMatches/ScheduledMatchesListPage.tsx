import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createScheduledMatch, getScheduledMatches } from "../../api/scheduledMatches"
import { Button } from "../../components/common/Button"
import { Card } from "../../components/common/Card"
import { EmptyState } from "../../components/common/EmptyState"
import { TextField } from "../../components/common/TextField"
import { attendanceSummary } from "../../lib/attendance"
import { formatFechaConAnio, formatHora } from "../../lib/date"
import { emptyScheduledMatchForm, scheduledMatchFormToPayload } from "./scheduledMatchForm"
import type { ScheduledMatchListDto } from "../../types/scheduledMatch"

const timeOptions = [
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
]
export function ScheduledMatchesListPage() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState<ScheduledMatchListDto[] | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyScheduledMatchForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getScheduledMatches().then(setMatches)
  }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.fecha || !form.lugar.trim()) return

    if (new Date(form.fecha) < new Date()) {
      setError("No podés programar un partido en el pasado.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const result = await createScheduledMatch(scheduledMatchFormToPayload(form))
      navigate(`/proximos/${result.id}`)
    } catch {
      setError("No se pudo programar el partido.")
      setSaving(false)
    }
  }

  const [fechaDate, fechaTime] = form.fecha.split("T")
  const displayTime = fechaTime?.substring(0, 5) || "20:00"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-cancha-900">Próximos partidos</h1>
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Programar"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <TextField
                  label="Fecha"
                  name="fechaDate"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={fechaDate}
                  onChange={(e) => setForm((f) => ({ ...f, fecha: `${e.target.value}T${displayTime}` }))}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-cancha-900">Hora</span>
                  <select
                    className="rounded-xl border border-cancha-200 bg-white px-3 py-2.5 text-cancha-950 outline-none focus:border-cancha-500 focus:ring-2 focus:ring-cancha-100"
                    value={displayTime}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fecha: `${fechaDate || new Date().toISOString().split("T")[0]}T${e.target.value}`,
                      }))
                    }
                    required
                  >
                    {!timeOptions.includes(displayTime) && <option value={displayTime}>{displayTime}</option>}
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <TextField
              label="Cancha / lugar"
              name="lugar"
              placeholder="ej. Cancha Norte"
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
              placeholder="ej. Llevar pechera"
              value={form.notas}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Programar partido"}
            </Button>
          </form>
        </Card>
      )}

      {matches === null && <p className="text-cancha-950/60">Cargando...</p>}

      {matches !== null && matches.length === 0 && (
        <EmptyState
          title="No hay partidos programados"
          description="Programá el próximo partido para que el grupo confirme asistencia."
        />
      )}

      {matches !== null && matches.length > 0 && (
        <ul className="flex flex-col gap-2">
          {matches.map((m) => (
            <li key={m.id}>
              <Link to={`/proximos/${m.id}`}>
                <Card className="flex flex-col gap-1 hover:border-cancha-300">
                  <p className="font-semibold text-cancha-950">
                    {formatFechaConAnio(m.fecha)} · {formatHora(m.fecha)}
                  </p>
                  <p className="text-sm text-cancha-950/60">
                    {m.lugar}
                    {m.cupoMaximo && ` · cupo ${m.cupoMaximo}`}
                  </p>
                  <p className="text-sm text-cancha-950/60">{attendanceSummary(m)}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
