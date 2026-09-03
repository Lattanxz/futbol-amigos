export interface Slot {
  key: string
  xPct: number
  yPct: number
  label: string
}

// Each shape lists outfield lines from defense (closest to own goal) to attack,
// e.g. [4, 4, 2] = 4 defenders, 4 midfielders, 2 forwards. The goalkeeper is implicit.
const FORMATION_SHAPES: Record<string, number[]> = {
  // Fútbol 5 (4 jugadores de campo + arquero)
  "2-2": [2, 2],
  "1-2-1": [1, 2, 1],
  // Fútbol 7 (6 jugadores de campo + arquero)
  "3-2-1": [3, 2, 1],
  "2-3-1": [2, 3, 1],
  // Fútbol 11 (10 jugadores de campo + arquero)
  "4-4-2": [4, 4, 2],
  "4-3-3": [4, 3, 3],
  "3-5-2": [3, 5, 2],
}

function lineLabel(index: number, total: number): string {
  if (index === 0) return "Def"
  if (index === total - 1) return "Del"
  return "Med"
}

function buildSlots(shape: number[]): Slot[] {
  const slots: Slot[] = [{ key: "ARQ-1", xPct: 50, yPct: 92, label: "Arquero" }]

  const lines = shape.length
  shape.forEach((count, lineIndex) => {
    const yPct = lines === 1 ? 45 : 78 - (lineIndex * (78 - 15)) / (lines - 1)
    const label = lineLabel(lineIndex, lines)
    const prefix = label.slice(0, 3).toUpperCase()

    for (let i = 0; i < count; i++) {
      const xPct = count === 1 ? 50 : 12 + (i * (88 - 12)) / (count - 1)
      slots.push({ key: `${prefix}-${i + 1}`, xPct, yPct, label })
    }
  })

  return slots
}

export const FORMATIONS: Record<string, Slot[]> = Object.fromEntries(
  Object.entries(FORMATION_SHAPES).map(([name, shape]) => [name, buildSlots(shape)]),
)

export const FORMATION_GROUPS = [
  { label: "Fútbol 5", formaciones: ["2-2", "1-2-1"] },
  { label: "Fútbol 7", formaciones: ["3-2-1", "2-3-1"] },
  { label: "Fútbol 11", formaciones: ["4-4-2", "4-3-3", "3-5-2"] },
]

export function formationCapacity(formacion: string): number {
  return FORMATIONS[formacion]?.length ?? 0
}
