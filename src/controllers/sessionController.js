import { apiFetch, normalizeId } from '../lib/apiClient'
import { startOfDay, daysBetween } from '../lib/utils'

const cache = {
  sessions: [],
  activeSession: null,
  progressBySessionId: {},
  answersByKey: {},
}

function answersCacheKey(sessionId, dayId) {
  return `${sessionId}:${dayId}`
}

function mapSession(session) {
  if (!session) return null
  const normalized = normalizeId(session)
  return {
    id: normalized.id,
    startDay: normalized.startDay ?? 1,
    createdAt: normalized.createdAt,
    completedAt: normalized.completedAt ?? null,
    status: normalized.status ?? 'active',
    label: normalized.label,
    weekLabel: normalized.weekLabel,
    completedAtLabel: normalized.completedAtLabel,
  }
}

/** Same rule as backend: prefer most recent completed, else newest session (list is newest-first). */
export function resolveSessionFallbackFromHistory(sessions) {
  if (!sessions?.length) return null
  return sessions.find((s) => s.status === 'completed') ?? sessions[0]
}

function mapProgress(progress, sessionId) {
  if (!progress) {
    return {
      sessionId,
      startDay: 1,
      startedAt: new Date().toISOString(),
      completedDays: [],
      simulatedDaysOffset: 0,
    }
  }

  const normalized = normalizeId(progress)
  return {
    sessionId: normalized.sessionId ?? sessionId,
    startDay: normalized.startDay ?? 1,
    startedAt: normalized.startedAt ?? new Date().toISOString(),
    completedDays: normalized.completedDays ?? [],
    simulatedDaysOffset: normalized.simulatedDaysOffset ?? 0,
  }
}

function setCacheProgress(sessionId, progress) {
  cache.progressBySessionId[sessionId] = mapProgress(progress, sessionId)
}

function extractList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.sessions)) return data.sessions
  return []
}

export function getSessionsHistory() {
  return cache.sessions
}

export function getSessionMeta(sessionId) {
  return cache.sessions.find((session) => session.id === sessionId) ?? null
}

export function getActiveSession() {
  return cache.activeSession
}

export function getSessionProgress(sessionId) {
  return (
    cache.progressBySessionId[sessionId] ?? {
      startDay: 1,
      startedAt: new Date().toISOString(),
      completedDays: [],
      simulatedDaysOffset: 0,
    }
  )
}

export async function loadSessions() {
  const data = await apiFetch('/sessions')
  cache.sessions = extractList(data).map(mapSession)
  return cache.sessions
}

export async function loadActiveSession() {
  try {
    const data = await apiFetch('/sessions/active')
    const session = mapSession(data?.session ?? data)
    cache.activeSession = session?.id ? session : null
  } catch (error) {
    if (error.status === 404) {
      cache.activeSession = null
      return null
    }
    throw error
  }

  return cache.activeSession
}

export async function loadSessionProgress(sessionId) {
  const data = await apiFetch(`/sessions/${sessionId}/progress`)
  const progress = mapProgress(data?.progress ?? data, sessionId)
  setCacheProgress(sessionId, progress)
  return progress
}

export async function refreshSessionState() {
  await loadSessions()
  await loadActiveSession()

  let focus = cache.activeSession
  if (!focus?.id && cache.sessions.length) {
    const fallback = resolveSessionFallbackFromHistory(cache.sessions)
    if (fallback?.id) {
      cache.activeSession = fallback
      focus = fallback
    }
  }

  if (focus?.id) {
    await loadSessionProgress(focus.id)
  }

  return {
    sessions: cache.sessions,
    activeSession: cache.activeSession,
    progress: focus?.id ? getSessionProgress(focus.id) : null,
  }
}

export async function createSession(startDay = 1) {
  const data = await apiFetch('/sessions', {
    method: 'POST',
    body: { startDay: Number(startDay) },
  })

  const session = mapSession(data?.session ?? data)
  if (session?.id) {
    cache.activeSession = session
    if (!cache.sessions.some((item) => item.id === session.id)) {
      cache.sessions = [session, ...cache.sessions]
    }
    await loadSessionProgress(session.id)
  }

  return session
}

export async function startNewSession(startDay = 1) {
  return createSession(startDay)
}

export async function getDayAnswers(sessionId, dayId) {
  const key = answersCacheKey(sessionId, dayId)
  if (cache.answersByKey[key]) {
    return cache.answersByKey[key]
  }

  try {
    const data = await apiFetch(`/sessions/${sessionId}/days/${dayId}/answers`)
    const answers = data?.answers ?? data ?? {}
    cache.answersByKey[key] = answers
    return answers
  } catch (error) {
    if (error.status === 404) {
      cache.answersByKey[key] = {}
      return {}
    }
    throw error
  }
}

export async function saveDayAnswers(sessionId, dayId, answers) {
  const key = answersCacheKey(sessionId, dayId)
  cache.answersByKey[key] = answers

  const data = await apiFetch(`/sessions/${sessionId}/days/${dayId}/answers`, {
    method: 'PUT',
    body: { answers },
  })

  const saved = data?.answers ?? answers
  cache.answersByKey[key] = saved
  return saved
}

export async function markDayComplete(sessionId, dayId) {
  const data = await apiFetch(`/sessions/${sessionId}/days/${dayId}/complete`, {
    method: 'POST',
  })

  const progress = mapProgress(data?.progress ?? data, sessionId)
  setCacheProgress(sessionId, progress)

  if (data?.session) {
    const session = mapSession(data.session)
    cache.sessions = cache.sessions.map((item) => (item.id === session.id ? session : item))
    if (session.status !== 'active') {
      cache.activeSession = null
    }
  } else {
    await loadSessionProgress(sessionId)
    await loadSessions()
    await loadActiveSession()
  }

  return getSessionProgress(sessionId)
}

export async function simulateNextDay(sessionId) {
  const current = getSessionProgress(sessionId)
  const simulatedDaysOffset = (current.simulatedDaysOffset || 0) + 1

  try {
    const data = await apiFetch(`/sessions/${sessionId}/progress`, {
      method: 'PATCH',
      body: { simulatedDaysOffset },
    })
    const progress = mapProgress(data?.progress ?? data, sessionId)
    setCacheProgress(sessionId, progress)
    return progress
  } catch (error) {
    if (error.status === 404 || error.status === 405) {
      const progress = { ...current, simulatedDaysOffset }
      setCacheProgress(sessionId, progress)
      return progress
    }
    throw error
  }
}

export function getEffectiveDayIndex(sessionId) {
  const meta = getSessionMeta(sessionId)
  if (meta?.status === 'completed') return 22

  const progress = getSessionProgress(sessionId)
  const started = startOfDay(new Date(progress.startedAt))
  const today = startOfDay(new Date())
  const elapsed = daysBetween(started, today) + (progress.simulatedDaysOffset || 0)
  return progress.startDay + elapsed
}

export function getCompletedCount(sessionId) {
  const meta = getSessionMeta(sessionId)
  if (meta?.status === 'completed') return 21
  return getSessionProgress(sessionId).completedDays.length
}

export function isSessionCompleted(sessionId) {
  return getSessionMeta(sessionId)?.status === 'completed'
}

export async function ensureSessionProgress(sessionId) {
  if (cache.progressBySessionId[sessionId]) {
    return getSessionProgress(sessionId)
  }
  return loadSessionProgress(sessionId)
}

export async function deleteSession(sessionId) {
  await apiFetch(`/sessions/${sessionId}`, { method: 'DELETE' })

  cache.sessions = cache.sessions.filter((item) => item.id !== sessionId)
  if (cache.activeSession?.id === sessionId) {
    cache.activeSession = null
  }
  delete cache.progressBySessionId[sessionId]

  Object.keys(cache.answersByKey).forEach((key) => {
    if (key.startsWith(`${sessionId}:`)) {
      delete cache.answersByKey[key]
    }
  })
}

export function clearSessionCache() {
  cache.sessions = []
  cache.activeSession = null
  cache.progressBySessionId = {}
  cache.answersByKey = {}
}
