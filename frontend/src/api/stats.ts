import { apiClient } from "./client"
import type { RankingDto } from "../types/stats"

export function getRanking() {
  return apiClient.get<RankingDto>("/stats/ranking").then((r) => r.data)
}
