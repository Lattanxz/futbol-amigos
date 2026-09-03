import type { ReactNode } from "react"

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-cancha-200 bg-cancha-50 px-6 py-10 text-center">
      <p className="text-base font-semibold text-cancha-900">{title}</p>
      {description && <p className="text-sm text-cancha-700">{description}</p>}
      {action}
    </div>
  )
}
