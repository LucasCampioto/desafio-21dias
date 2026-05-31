import {
  getSessionProgress,
  getEffectiveDayIndex,
  getSessionMeta,
} from './sessionController'

export function getDayStatus(dayId, sessionId) {
  if (!sessionId) return 'locked'

  const meta = getSessionMeta(sessionId)
  if (!meta) return 'locked'

  const progress = getSessionProgress(sessionId)
  const startDay = progress.startDay || 1
  const currentDay = Math.min(getEffectiveDayIndex(sessionId), 21)

  if (dayId < startDay || dayId > currentDay) return 'locked'
  if (progress.completedDays.includes(dayId)) return 'completed'
  if (dayId === currentDay && meta.status !== 'completed') return 'active'
  return 'available'
}

export function canAccessDay(dayId, sessionId) {
  return getDayStatus(dayId, sessionId) !== 'locked'
}

export function getCurrentActiveDay(sessionId) {
  if (!sessionId) return null
  const meta = getSessionMeta(sessionId)
  if (meta?.status === 'completed') return 21
  return Math.min(getEffectiveDayIndex(sessionId), 21)
}
