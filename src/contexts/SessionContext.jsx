import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import * as sessionController from '../controllers/sessionController'
import { getCurrentActiveDay, getDayStatus } from '../controllers/dayAccessController'
import { useAuth } from './AuthContext'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState([])
  const [session, setSession] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      sessionController.clearSessionCache()
      setSessions([])
      setSession(null)
      setProgress(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const state = await sessionController.refreshSessionState()
      setSessions(state.sessions)
      setSession(state.activeSession)
      setProgress(state.progress)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a jornada.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const startSession = useCallback(async (startDay) => {
    const nextSession = await sessionController.startNewSession(startDay)
    const state = await sessionController.refreshSessionState()
    setSessions(state.sessions)
    setSession(state.activeSession)
    setProgress(state.progress)
    return nextSession
  }, [])

  const saveAnswers = useCallback(async (dayId, answers, sessionId = session?.id) => {
    if (!sessionId) return
    await sessionController.saveDayAnswers(sessionId, dayId, answers)
  }, [session])

  const getAnswers = useCallback(async (dayId, sessionId = session?.id) => {
    if (!sessionId) return {}
    return sessionController.getDayAnswers(sessionId, dayId)
  }, [session])

  const completeDay = useCallback(
    async (dayId, sessionId = session?.id) => {
      if (!sessionId) return
      await sessionController.markDayComplete(sessionId, dayId)
      await refresh()
    },
    [session, refresh],
  )

  const simulateNextDay = useCallback(
    async (sessionId = session?.id) => {
      if (!sessionId) return
      await sessionController.simulateNextDay(sessionId)
      await refresh()
    },
    [session, refresh],
  )

  const getStatus = useCallback((dayId, sessionId = session?.id) => {
    if (!sessionId) return 'locked'
    return getDayStatus(dayId, sessionId)
  }, [session, progress, sessions])

  const getSessionById = useCallback((sessionId) => {
    return sessionController.getSessionMeta(sessionId)
  }, [sessions])

  const deleteSession = useCallback(
    async (sessionId) => {
      await sessionController.deleteSession(sessionId)
      await refresh()
    },
    [refresh],
  )

  const currentDay = session ? getCurrentActiveDay(session.id) : null

  const value = useMemo(
    () => ({
      session,
      sessions,
      progress,
      loading,
      error,
      currentDay,
      hasSession: Boolean(session),
      hasActiveSession: Boolean(session?.status === 'active'),
      startSession,
      saveAnswers,
      getAnswers,
      completeDay,
      simulateNextDay,
      getStatus,
      getSessionById,
      deleteSession,
      refresh,
      completedCount: session ? sessionController.getCompletedCount(session.id) : 0,
      isSessionCompleted: (id) => sessionController.isSessionCompleted(id),
    }),
    [
      session,
      sessions,
      progress,
      loading,
      error,
      currentDay,
      startSession,
      saveAnswers,
      getAnswers,
      completeDay,
      simulateNextDay,
      getStatus,
      getSessionById,
      deleteSession,
      refresh,
    ],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
