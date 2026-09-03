import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createMatch, getMatch, updateMatch } from "../../api/matches"
import { getPlayers } from "../../api/players"
import { useAuth } from "../../auth/AuthContext"
import { Button } from "../../components/common/Button"
import { EmptyState } from "../../components/common/EmptyState"
import type { PlayerListDto } from "../../types"
import { Step1DateVenue } from "./Step1DateVenue"
import { Step2BuildTeams } from "./Step2BuildTeams"
import { Step3Formations, isFormationsStepComplete } from "./Step3Formations"
import { Step4Result } from "./Step4Result"
import { Step5Cards } from "./Step5Cards"
import { emptyWizardState, wizardStateFromMatch, wizardStateToPayload, type WizardState } from "./wizardState"

const STEPS = [
  { title: "Fecha y cancha" },
  { title: "Armar equipos" },
  { title: "Formaciones" },
  { title: "Resultado" },
  { title: "Tarjetas" },
]

export function MatchWizardPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== undefined
  const navigate = useNavigate()
  const { user } = useAuth()

  const [players, setPlayers] = useState<PlayerListDto[] | null>(null)
  const [state, setState] = useState<WizardState>(emptyWizardState)
  const [stepIndex, setStepIndex] = useState(0)
  const [loading, setLoading] = useState(isEditing)
  const [forbidden, setForbidden] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPlayers().then(setPlayers)
  }, [])

  useEffect(() => {
    if (!isEditing || !id) return
    getMatch(Number(id)).then((match) => {
      if (match.creadoPorUserId !== user?.id) {
        setForbidden(true)
        setLoading(false)
        return
      }
      setState(wizardStateFromMatch(match))
      setLoading(false)
    })
  }, [id, isEditing, user?.id])

  const update = (patch: Partial<WizardState>) => setState((prev) => ({ ...prev, ...patch }))

  if (loading || players === null) {
    return <p className="text-cancha-950/60">Cargando...</p>
  }

  if (forbidden) {
    return (
      <EmptyState
        title="No podés editar este partido"
        description="Solo quien lo cargó puede modificarlo o eliminarlo."
      />
    )
  }

  const canGoNext = (() => {
    switch (stepIndex) {
      case 0:
        return state.fecha !== "" && state.lugar.trim() !== ""
      case 1:
        return state.teamAIds.length > 0 && state.teamBIds.length > 0
      case 2:
        return isFormationsStepComplete(state)
      default:
        return true
    }
  })()

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = wizardStateToPayload(state)
      const result = isEditing ? await updateMatch(Number(id), payload) : await createMatch(payload)
      navigate(`/partidos/${result.id}`)
    } catch {
      setError("No se pudo guardar el partido. Revisá los datos e intentá de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const isLastStep = stepIndex === STEPS.length - 1

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-cancha-900">{isEditing ? "Editar partido" : "Nuevo partido"}</h1>
        <div className="mt-2 flex gap-1">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-cancha-600" : "bg-cancha-100"}`}
            />
          ))}
        </div>
        <p className="mt-1 text-sm font-medium text-cancha-950/60">
          Paso {stepIndex + 1} de {STEPS.length} · {STEPS[stepIndex].title}
        </p>
      </div>

      {stepIndex === 0 && <Step1DateVenue state={state} update={update} />}
      {stepIndex === 1 && <Step2BuildTeams state={state} update={update} players={players} />}
      {stepIndex === 2 && <Step3Formations state={state} update={update} players={players} />}
      {stepIndex === 3 && <Step4Result state={state} update={update} players={players} />}
      {stepIndex === 4 && <Step5Cards state={state} update={update} players={players} />}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pb-4">
        {stepIndex > 0 && (
          <Button variant="ghost" className="border border-cancha-200" onClick={() => setStepIndex((s) => s - 1)}>
            Atrás
          </Button>
        )}
        {!isLastStep ? (
          <Button className="flex-1" disabled={!canGoNext} onClick={() => setStepIndex((s) => s + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button className="flex-1" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar partido"}
          </Button>
        )}
      </div>
    </div>
  )
}
