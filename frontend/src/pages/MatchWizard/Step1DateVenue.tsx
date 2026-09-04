import { TextField } from "../../components/common/TextField"
import type { WizardState } from "./wizardState"

const timeOptions = [
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
]

export function Step1DateVenue({
  state,
  update,
}: {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}) {
  const [fechaDate, fechaTime] = state.fecha.split("T")
  const displayTime = fechaTime?.substring(0, 5) || "20:00"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <TextField
            label="Fecha"
            name="fechaDate"
            type="date"
            value={fechaDate}
            onChange={(e) => update({ fecha: `${e.target.value}T${displayTime}` })}
            required
          />
        </div>
        <div className="flex-1">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-cancha-900">Hora</span>
            <select
              className="rounded-xl border border-cancha-200 bg-white px-3 py-2.5 text-cancha-950 outline-none focus:border-cancha-500 focus:ring-2 focus:ring-cancha-100"
              value={displayTime}
              onChange={(e) =>
                update({ fecha: `${fechaDate || new Date().toISOString().split("T")[0]}T${e.target.value}` })
              }
              required
            >
              {!timeOptions.includes(displayTime) && <option value={displayTime}>{displayTime}</option>}
              {timeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <TextField
        label="Cancha / lugar"
        name="lugar"
        placeholder="ej. Cancha Norte"
        value={state.lugar}
        onChange={(e) => update({ lugar: e.target.value })}
        required
      />
    </div>
  )
}
