import type { ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-cancha-600 text-white hover:bg-cancha-700 active:bg-cancha-800",
  secondary: "bg-acento-500 text-white hover:bg-acento-600 active:bg-acento-600",
  ghost: "bg-transparent text-cancha-700 hover:bg-cancha-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
