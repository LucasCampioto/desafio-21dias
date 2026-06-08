import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDayById } from '../content'
import { useSession } from '../contexts/SessionContext'
import { canAccessDay } from '../controllers/dayAccessController'
import * as sessionController from '../controllers/sessionController'
import DayContentRenderer from '../components/journey/DayContentRenderer'
import DayExplanationAccordion from '../components/journey/DayExplanationAccordion'
import VoiceNotePanel from '../components/journey/VoiceNotePanel'
import Button from '../design-system/Button'
import Badge from '../design-system/Badge'
import { Icon } from '@iconify/react'

export default function DayPage() {
  const { sessionId, dayId } = useParams()
  const navigate = useNavigate()
  const day = getDayById(dayId)
  const { saveAnswers, completeDay, getStatus, getSessionById, refresh } = useSession()
  const [answers, setAnswers] = useState({})
  const [saved, setSaved] = useState(false)
  const [loadingAnswers, setLoadingAnswers] = useState(true)
  const [progressReady, setProgressReady] = useState(false)
  const saveDebounceRef = useRef(null)
  const savedIndicatorRef = useRef(null)
  const pendingAnswersRef = useRef({})
  const hasUserEditedRef = useRef(false)

  const session = getSessionById(sessionId)
  const id = Number(dayId)
  const status = progressReady ? getStatus(id, sessionId) : 'locked'
  const dayCompleted = status === 'completed'
  const canEdit = progressReady && (status === 'active' || status === 'available' || status === 'completed')
  const readOnly = progressReady && !canEdit
  const showCompleteButton =
    progressReady && !dayCompleted && (status === 'active' || status === 'available')

  useEffect(() => {
    if (!sessionId) return

    let cancelled = false

    sessionController
      .ensureSessionProgress(sessionId)
      .then(() => {
        if (!cancelled) {
          setProgressReady(true)
          refresh()
        }
      })
      .catch(() => {
        if (!cancelled) setProgressReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, refresh])

  useEffect(() => {
    if (!sessionId || !dayId) return

    let cancelled = false
    hasUserEditedRef.current = false
    setLoadingAnswers(true)

    sessionController
      .getDayAnswers(sessionId, id)
      .then((loaded) => {
        if (!cancelled && !hasUserEditedRef.current) {
          setAnswers(loaded)
          pendingAnswersRef.current = loaded
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAnswers(false)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, dayId, id])

  useEffect(() => {
    pendingAnswersRef.current = answers
  }, [answers])

  useEffect(() => {
    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current)
        if (sessionId) {
          saveAnswers(id, pendingAnswersRef.current, sessionId)
        }
      }
      if (savedIndicatorRef.current) clearTimeout(savedIndicatorRef.current)
    }
  }, [id, sessionId, saveAnswers])

  const handleChange = useCallback(
    (fieldId, value) => {
      if (readOnly) return
      hasUserEditedRef.current = true

      setAnswers((prev) => {
        const next = { ...prev, [fieldId]: value }
        pendingAnswersRef.current = next
        return next
      })

      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
      saveDebounceRef.current = setTimeout(async () => {
        try {
          await saveAnswers(id, pendingAnswersRef.current, sessionId)
          setSaved(true)
          if (savedIndicatorRef.current) clearTimeout(savedIndicatorRef.current)
          savedIndicatorRef.current = setTimeout(() => setSaved(false), 2000)
        } catch {
          // Mantém o texto local; o usuário pode continuar editando.
        }
      }, 600)
    },
    [id, sessionId, saveAnswers, readOnly],
  )

  if (!day) {
    return (
      <div className="p-8 text-center text-beige">
        <p>Dia não encontrado.</p>
        <Link to="/jornada" className="mt-4 inline-block text-lime">
          Voltar às jornadas
        </Link>
      </div>
    )
  }

  if (!session) {
    navigate('/jornada')
    return null
  }

  if (progressReady && !canAccessDay(id, sessionId)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-stone-950 px-4 text-center">
        <Icon icon="solar:lock-linear" width={48} className="text-stone-500" />
        <h2 className="mt-4 font-serif text-3xl text-beige">Dia bloqueado</h2>
        <p className="mt-2 max-w-md text-stone-400">
          Este dia ainda não está disponível nesta jornada.
        </p>
        <Link to={`/jornada/sessao/${sessionId}`} className="mt-6">
          <Button variant="accent">Ver timeline</Button>
        </Link>
      </div>
    )
  }

  const handleComplete = async () => {
    await completeDay(id, sessionId)
    navigate(`/jornada/sessao/${sessionId}`)
  }

  return (
    <div className="min-h-screen overflow-anchor-none bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 px-4 py-8 md:px-12">
      <div className="mx-auto max-w-3xl [overflow-anchor:none]">
        <Link
          to={`/jornada/sessao/${sessionId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-400 hover:text-beige"
        >
          <Icon icon="solar:arrow-left-linear" width={18} />
          {session.label}
        </Link>

        <div>
          <Badge variant="dark" className="mb-4">
            <span>
              Semana {day.week} — {day.weekTitle}
            </span>
          </Badge>
          <h1 className="font-serif text-4xl font-light text-beige md:text-5xl">
            Dia {day.id}: {day.title}
          </h1>
          <p className="mt-3 text-lg text-stone-400">{day.focus}</p>
          <p
            className={`mt-2 h-5 text-sm text-lime ${saved ? 'opacity-100' : 'opacity-0'}`}
            aria-live="polite"
          >
            Respostas salvas automaticamente
          </p>
          <p className="mt-2 h-5 text-sm text-stone-500">
            {loadingAnswers ? 'Carregando respostas...' : '\u00a0'}
          </p>
        </div>

        <div className="mt-8">
          <DayExplanationAccordion explanation={day.explanation} />
        </div>

        <div className="mt-10">
          <DayContentRenderer
            day={day}
            answers={answers}
            onAnswerChange={handleChange}
            readOnly={readOnly}
          />
        </div>

        <div className="mt-8">
          <VoiceNotePanel readOnly={readOnly} />
        </div>

        {showCompleteButton && (
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="accent" onClick={handleComplete}>
              Concluir dia
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
