import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { AUTH_STORAGE_KEY } from "../api/client"
import * as authApi from "../api/auth"
import type { UserDto } from "../types"

interface StoredAuth {
  token: string
  expiresAt: string
  user: UserDto
}

interface AuthContextValue {
  user: UserDto | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(() => readStoredAuth()?.user ?? null)

  const persist = (auth: StoredAuth) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    setUser(auth.user)
  }

  const login = async (email: string, password: string) => {
    const auth = await authApi.login(email, password)
    persist(auth)
  }

  const register = async (nombre: string, email: string, password: string) => {
    const auth = await authApi.register(nombre, email, password)
    persist(auth)
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
