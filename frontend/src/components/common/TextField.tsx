import type { InputHTMLAttributes } from "react"

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, className = "", ...props }: TextFieldProps) {
  const inputId = id ?? props.name
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-cancha-900">{label}</span>
      <input
        id={inputId}
        className={`rounded-xl border border-cancha-200 bg-white px-3 py-2.5 text-cancha-950 outline-none focus:border-cancha-500 focus:ring-2 focus:ring-cancha-100 ${className}`}
        {...props}
      />
    </label>
  )
}
