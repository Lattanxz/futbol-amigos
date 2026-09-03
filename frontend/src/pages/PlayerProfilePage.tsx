import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deletePlayer, getPlayer, updatePlayer } from "../api/players"
import { Button } from "../components/common/Button"
import { Card } from "../components/common/Card"
import { Modal } from "../components/common/Modal"
import { TextField } from "../components/common/TextField"
import type { PlayerDetailDto } from "../types"

const stats = [
  { key: "partidosJugados", label: "Partidos" },
  { key: "goles", label: "Goles" },
  { key: "asistencias", label: "Asistencias" },
  { key: "porcentajeVictorias", label: "% Victorias", suffix: "%" },
] as const

export function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [player, setPlayer] = useState<PlayerDetailDto | null>(null)

  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState("")
  const [apodo, setApodo] = useState("")
  const [posicion, setPosicion] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = (playerId: number) => getPlayer(playerId).then(setPlayer)

  useEffect(() => {
    if (id) load(Number(id))
  }, [id])

  const startEditing = () => {
    if (!player) return
    setNombre(player.nombre)
    setApodo(player.apodo ?? "")
    setPosicion(player.posicionHabitual ?? "")
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!player || !nombre.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      await updatePlayer(player.id, {
        nombre,
        apodo: apodo || null,
        posicionHabitual: posicion || null,
      })
      await load(player.id)
      setEditing(false)
    } catch {
      setSaveError("No se pudo guardar los cambios.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!player) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deletePlayer(player.id)
      navigate("/jugadores", { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      setDeleteError(
        status === 409
          ? "No se puede eliminar: este jugador ya tiene partidos, goles o tarjetas registrados."
          : "No se pudo eliminar el jugador.",
      )
      setDeleting(false)
    }
  }

  if (!player) return <p className="text-cancha-950/60">Cargando...</p>

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cancha-100 text-2xl font-bold text-cancha-700">
          {player.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-cancha-900">{player.nombre}</h1>
          {player.apodo && <p className="text-cancha-950/60">"{player.apodo}"</p>}
          {player.posicionHabitual && (
            <span className="mt-1 inline-block rounded-full bg-acento-500/10 px-2 py-0.5 text-xs font-semibold text-acento-600">
              {player.posicionHabitual}
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button variant="ghost" className="border border-cancha-200 px-3 py-1.5 text-xs" onClick={startEditing}>
            Editar
          </Button>
          <Button
            variant="ghost"
            className="border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
            onClick={() => {
              setDeleteError(null)
              setConfirmingDelete(true)
            }}
          >
            Eliminar
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.key} className="text-center">
            <p className="text-2xl font-bold text-cancha-800">
              {player[s.key]}
              {"suffix" in s ? s.suffix : ""}
            </p>
            <p className="text-xs font-medium text-cancha-950/60">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-2 font-semibold text-cancha-900">Historial</h2>
        <p className="text-sm text-cancha-950/60">
          {player.victorias} victorias, {player.empates} empates, {player.derrotas} derrotas en{" "}
          {player.partidosJugados} partidos jugados.
        </p>
      </Card>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar jugador">
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <TextField label="Nombre" name="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <TextField label="Apodo (opcional)" name="apodo" value={apodo} onChange={(e) => setApodo(e.target.value)} />
          <TextField
            label="Posición habitual (opcional)"
            name="posicion"
            placeholder="ej. Delantero"
            value={posicion}
            onChange={(e) => setPosicion(e.target.value)}
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
      </Modal>

      <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Eliminar jugador">
        <p className="text-sm text-cancha-950/70">
          ¿Seguro que querés eliminar a <strong>{player.nombre}</strong>? Esta acción no se puede deshacer.
        </p>
        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
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
