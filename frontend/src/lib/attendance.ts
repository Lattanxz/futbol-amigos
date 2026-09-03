interface AttendanceCounts {
  totalJugadores: number
  cantidadVa: number
  cantidadDuda: number
  cantidadNo: number
}

export function attendanceSummary({ totalJugadores, cantidadVa, cantidadDuda, cantidadNo }: AttendanceCounts) {
  const sinResponder = totalJugadores - cantidadVa - cantidadDuda - cantidadNo
  return `${cantidadVa} van · ${cantidadDuda} dudan · ${cantidadNo} no van · ${sinResponder} sin responder`
}
