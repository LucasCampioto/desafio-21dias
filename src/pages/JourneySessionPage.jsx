import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useSession } from '../contexts/SessionContext'
import * as sessionController from '../controllers/sessionController'
import WeekTimeline from '../components/journey/WeekTimeline'
import Button from '../design-system/Button'
import Badge from '../design-system/Badge'

export default function JourneySessionPage() {
  const { sessionId } = useParams()
  const { getStatus, getSessionById, simulateNextDay, refresh } = useSession()
  const [progressReady, setProgressReady] = useState(false)

  const session = getSessionById(sessionId)
  const isCompleted = session?.status === 'completed'
  const completedCount = sessionId ? sessionController.getCompletedCount(sessionId) : 0
  const currentDay = sessionId
    ? Math.min(sessionController.getEffectiveDayIndex(sessionId), 21)
    : null

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

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="font-serif text-3xl text-beige">Jornada não encontrada</p>
        <Link to="/jornada" className="mt-6">
          <Button variant="accent">Voltar às jornadas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto mb-8 max-w-2xl">
        <Link
          to="/jornada"
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-400 hover:text-beige"
        >
          <Icon icon="solar:arrow-left-linear" width={18} />
          Todas as jornadas
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {isCompleted ? (
              <Badge variant="dark" className="mb-3 border-green-600/30 text-green-400">
                <Icon icon="solar:check-circle-bold" width={14} />
                Jornada concluída
              </Badge>
            ) : (
              <Badge variant="accent" className="mb-3">
                Em andamento
              </Badge>
            )}
            <h1 className="font-serif text-3xl font-light text-beige md:text-4xl">{session.label}</h1>
            <p className="mt-2 text-sm text-stone-400">{session.weekLabel}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-400">
            {completedCount} de 21 dias concluídos
            {!isCompleted && currentDay && progressReady && ` · Dia atual: ${currentDay}`}
          </p>
          {!isCompleted && progressReady && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => simulateNextDay(sessionId)}>
                Simular próximo dia
              </Button>
              <Link to={`/jornada/sessao/${sessionId}/dia/${currentDay}`}>
                <Button variant="accent" size="sm">
                  Ir para hoje
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <WeekTimeline
          sessionId={sessionId}
          isCompleted={isCompleted}
          getStatus={(dayId) => (progressReady ? getStatus(dayId, sessionId) : 'locked')}
          currentDay={progressReady ? currentDay : null}
        />
      </motion.div>
    </div>
  )
}
