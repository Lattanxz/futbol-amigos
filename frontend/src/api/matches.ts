import { apiClient } from "./client"
import type { MatchDetailDto, MatchListDto, MatchUpsertRequest } from "../types"

export interface MatchFilters {
  jugadorId?: number
  cancha?: string
  desde?: string
  hasta?: string
}

export function getMatches(filters: MatchFilters = {}) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""))
  return apiClient.get<MatchListDto[]>("/matches", { params }).then((r) => r.data)
}

export function getMatch(id: number) {
  return apiClient.get<MatchDetailDto>(`/matches/${id}`).then((r) => r.data)
}

export function createMatch(payload: MatchUpsertRequest) {
  return apiClient.post<MatchDetailDto>("/matches", payload).then((r) => r.data)
}

export function updateMatch(id: number, payload: MatchUpsertRequest) {
  return apiClient.put<MatchDetailDto>(`/matches/${id}`, payload).then((r) => r.data)
}

export function deleteMatch(id: number) {
  return apiClient.delete(`/matches/${id}`)
}
