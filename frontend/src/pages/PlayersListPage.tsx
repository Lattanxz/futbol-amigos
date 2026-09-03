import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { createPlayer, getPlayers } from "../api/players"
import { Button } from "../components/common/Button"
import { Card } from "../components/common/Card"
import { EmptyState } from "../components/common/EmptyState"
import { TextField } from "../components/common/TextField"
import type { PlayerListDto } from "../types"

export function PlayersListPage() {
  const [players, setPlayers] = useState<PlayerListDto[] | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState("")
  const [apodo, setApodo] = useState("")
  const [posicion, setPosicion] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => getPlayers().then(setPlayers)

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createPlayer({
        nombre,
        apodo: apodo || null,
        posicionHabitual: posicion || null,
      })
      setNombre("")
      setApodo("")
      setPosicion("")
      setShowForm(false)
      await load()
    } catch {
      setError("No se pudo agregar el jugador.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-cancha-900">Jugadores</h1>
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Agregar"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <TextField
              label="Nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <TextField
              label="Apodo (opcional)"
              name="apodo"
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
            />
            <TextField
              label="Posición habitual (opcional)"
              name="posicion"
              placeholder="ej. Delantero"
              value={posicion}
              onChange={(e) => setPosicion(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar jugador"}
            </Button>
          </form>
        </Card>
      )}

      {players === null && <p className="text-cancha-950/60">Cargando...</p>}

      {players !== null && players.length === 0 && (
        <EmptyState
          title="Todavía no hay jugadores"
          description="Agregá al primer jugador del grupo para empezar."
        />
      )}

      {players !== null && players.length > 0 && (
        <ul className="flex flex-col gap-2">
          {players.map((p) => (
            <li key={p.id}>
              <Link to={`/jugadores/${p.id}`}>
                <Card className="flex items-center gap-3 transition-colors hover:border-cancha-300">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cancha-100 font-bold text-cancha-700">
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-cancha-950">
                      {p.nombre} {p.apodo && <span className="text-cancha-950/50">"{p.apodo}"</span>}
                    </p>
                    {p.posicionHabitual && (
                      <p className="truncate text-sm text-cancha-950/60">{p.posicionHabitual}</p>
                    )}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
