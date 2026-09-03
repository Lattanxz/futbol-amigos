import { NavLink } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

const links = [
  { to: "/", label: "Inicio" },
  { to: "/jugadores", label: "Jugadores" },
  { to: "/partidos", label: "Historial" },
  { to: "/ranking", label: "Ranking" },
]

export function TopBar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-cancha-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-cancha-800">
          <span className="text-xl">⚽</span>
          Futbol Amigos
        </NavLink>

        <nav className="hidden gap-1 sm:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive ? "bg-cancha-100 text-cancha-800" : "text-cancha-950/70 hover:bg-cancha-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-cancha-950/70 sm:inline">{user?.nombre}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-cancha-950/70 hover:bg-cancha-50"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
