import { apiClient } from "./client"
import type { AuthResponse } from "../types"

export function login(email: string, password: string) {
  return apiClient
    .post<AuthResponse>("/auth/login", { email, password })
    .then((r) => r.data)
}

export function register(nombre: string, email: string, password: string) {
  return apiClient
    .post<AuthResponse>("/auth/register", { nombre, email, password })
    .then((r) => r.data)
}
