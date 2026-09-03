import { useState, type FormEvent } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import { Button } from "../components/common/Button"
import { Card } from "../components/common/Card"
import { TextField } from "../components/common/TextField"

export function LoginPage() {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState<"login" | "register">("login")
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/"
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(nombre, email, password)
      }
      navigate("/", { replace: true })
    } catch {
      setError(
        mode === "login"
          ? "Email o contraseña incorrectos."
          : "No se pudo crear la cuenta. Probá con otro email.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cancha-900 px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <span className="text-3xl">⚽</span>
          <h1 className="text-xl font-bold text-cancha-900">Futbol Amigos</h1>
          <p className="text-sm text-cancha-950/60">
            {mode === "login" ? "Ingresá con tu cuenta del grupo" : "Creá tu cuenta para el grupo"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <TextField
              label="Nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
            />
          )}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Un momento..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null)
            setMode((m) => (m === "login" ? "register" : "login"))
          }}
          className="mt-4 w-full text-center text-sm font-medium text-cancha-700 hover:underline"
        >
          {mode === "login" ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Ingresá"}
        </button>
      </Card>
    </div>
  )
}
