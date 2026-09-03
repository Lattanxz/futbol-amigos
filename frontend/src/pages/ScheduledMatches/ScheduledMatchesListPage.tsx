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
