import { TextField } from "../../components/common/TextField"
import type { WizardState } from "./wizardState"

export function Step1DateVenue({
  state,
  update,
}: {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="Fecha y hora"
        name="fecha"
        type="datetime-local"
        value={state.fecha}
        onChange={(e) => update({ fecha: e.target.value })}
        required
      />
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
