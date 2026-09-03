import { apiClient } from "./client"
import type {
  AttendanceRosterDto,
  AttendanceUpsertRequest,
  ScheduledMatchDetailDto,
  ScheduledMatchListDto,
  ScheduledMatchUpsertRequest,
} from "../types/scheduledMatch"

export function getScheduledMatches(incluirPasados = false) {
  return apiClient
    .get<ScheduledMatchListDto[]>("/scheduled-matches", { params: { incluirPasados } })
    .then((r) => r.data)
}

export function getScheduledMatch(id: number) {
  return apiClient.get<ScheduledMatchDetailDto>(`/scheduled-matches/${id}`).then((r) => r.data)
}

export function createScheduledMatch(payload: ScheduledMatchUpsertRequest) {
  return apiClient.post<ScheduledMatchDetailDto>("/scheduled-matches", payload).then((r) => r.data)
}

export function updateScheduledMatch(id: number, payload: ScheduledMatchUpsertRequest) {
  return apiClient.put<ScheduledMatchDetailDto>(`/scheduled-matches/${id}`, payload).then((r) => r.data)
}

export function deleteScheduledMatch(id: number) {
  return apiClient.delete(`/scheduled-matches/${id}`)
}

export function setAttendance(scheduledMatchId: number, playerId: number, payload: AttendanceUpsertRequest) {
  return apiClient
    .put<AttendanceRosterDto>(`/scheduled-matches/${scheduledMatchId}/attendance/${playerId}`, payload)
    .then((r) => r.data)
}
