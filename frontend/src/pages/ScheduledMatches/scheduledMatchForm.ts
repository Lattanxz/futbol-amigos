import type { ScheduledMatchDetailDto, ScheduledMatchUpsertRequest } from "../../types/scheduledMatch"

export interface ScheduledMatchForm {
  fecha: string
  lugar: string
  cupoMaximo: string
  notas: string
}

export function emptyScheduledMatchForm(): ScheduledMatchForm {
  const now = new Date()
  now.setSeconds(0, 0)
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  return { fecha: localIso, lugar: "", cupoMaximo: "", notas: "" }
}

export function scheduledMatchFormFromDetail(match: ScheduledMatchDetailDto): ScheduledMatchForm {
  return {
    fecha: match.fecha.slice(0, 16),
    lugar: match.lugar,
    cupoMaximo: match.cupoMaximo?.toString() ?? "",
    notas: match.notas ?? "",
  }
}

export function scheduledMatchFormToPayload(form: ScheduledMatchForm): ScheduledMatchUpsertRequest {
  return {
    fecha: form.fecha,
    lugar: form.lugar.trim(),
    cupoMaximo: form.cupoMaximo ? Number(form.cupoMaximo) : null,
    notas: form.notas.trim() || null,
  }
}
