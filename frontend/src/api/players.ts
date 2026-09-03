import { apiClient } from "./client"
import type { PlayerDetailDto, PlayerListDto, PlayerUpsertRequest } from "../types"

export function getPlayers() {
  return apiClient.get<PlayerListDto[]>("/players").then((r) => r.data)
}

export function getPlayer(id: number) {
  return apiClient.get<PlayerDetailDto>(`/players/${id}`).then((r) => r.data)
}

export function createPlayer(payload: PlayerUpsertRequest) {
  return apiClient.post<PlayerListDto>("/players", payload).then((r) => r.data)
}

export function updatePlayer(id: number, payload: PlayerUpsertRequest) {
  return apiClient.put<PlayerListDto>(`/players/${id}`, payload).then((r) => r.data)
}

export function deletePlayer(id: number) {
  return apiClient.delete(`/players/${id}`)
}
