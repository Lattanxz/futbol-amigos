import { NavLink } from "react-router-dom"

const links = [
  { to: "/", label: "Inicio", icon: "🏠" },
  { to: "/jugadores", label: "Jugadores", icon: "👤" },
  { to: "/partidos/nuevo", label: "Nuevo", icon: "⚽" },
  { to: "/partidos", label: "Historial", icon: "📋" },
  { to: "/ranking", label: "Ranking", icon: "🏆" },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-cancha-100 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] sm:hidden">
      <ul className="flex items-stretch justify-between px-1">
        {links.map((link) => (
          <li key={link.to} className="flex-1">
            <NavLink
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  isActive ? "text-cancha-700" : "text-cancha-950/50"
                }`
              }
            >
              <span className="text-lg leading-none">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
