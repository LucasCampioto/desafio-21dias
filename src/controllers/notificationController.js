import { STORAGE_KEYS } from '../lib/constants'
import { readStorage, writeStorage } from '../lib/utils'
import { getActiveSession, getSessionProgress, isSessionCompleted } from './sessionController'
import { getCurrentActiveDay, getDayStatus } from './dayAccessController'

const DEFAULT_PREFS = {
  enabled: false,
  reminderHour: 9,
  reminderMinute: 0,
  lastNotifiedDate: null,
  lastNotifiedSlot: null,
}

const MOTIVATIONAL_MESSAGES = [
  {
    title: 'Quantum Journal',
    body: 'Seu próximo passo está esperando por você.',
  },
  {
    title: 'Quantum Journal',
    body: 'Hoje é um bom dia para observar seus pensamentos.',
  },
  {
    title: 'Quantum Journal',
    body: 'Pequenas decisões moldam grandes identidades.',
  },
]

let serviceWorkerRegistrationPromise = null

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function isSecureNotificationContext() {
  return typeof window !== 'undefined' && window.isSecureContext
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  if (!isSecureNotificationContext()) return 'insecure'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function getNotificationPrefs() {
  const prefs = readStorage(STORAGE_KEYS.NOTIFICATION_PREFS, DEFAULT_PREFS)

  // Versão antiga só guardava a data — não bloqueia horários futuros.
  if (prefs.lastNotifiedDate && !prefs.lastNotifiedSlot) {
    return { ...prefs, lastNotifiedDate: null }
  }

  return prefs
}

export function saveNotificationPrefs(prefs) {
  writeStorage(STORAGE_KEYS.NOTIFICATION_PREFS, { ...getNotificationPrefs(), ...prefs })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('qj-notification-prefs-changed'))
  }
}

async function waitForActiveServiceWorker(registration) {
  if (registration.active) return registration

  await new Promise((resolve) => {
    const worker = registration.installing ?? registration.waiting

    if (!worker) {
      resolve()
      return
    }

    if (worker.state === 'activated') {
      resolve()
      return
    }

    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        resolve()
      }
    })
  })

  return navigator.serviceWorker.ready
}

async function getServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return null

  if (!serviceWorkerRegistrationPromise) {
    serviceWorkerRegistrationPromise = (async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        return waitForActiveServiceWorker(registration)
      } catch {
        return null
      }
    })()
  }

  return serviceWorkerRegistrationPromise
}

export function warmUpNotificationService() {
  void getServiceWorkerRegistration()
}

function showWindowNotification(payload, options) {
  const notification = new Notification(payload.title, options)

  notification.onclick = () => {
    window.focus()
    if (payload.url) {
      window.location.assign(payload.url)
    }
    notification.close()
  }

  return { ok: true, via: 'window' }
}

function todayKey() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function reminderSlotKey(hour, minute, dateKey = todayKey()) {
  return `${dateKey}-${hour}-${minute}`
}

function wasAlreadyNotifiedForSlot(prefs) {
  if (!hasPassedReminderTime(prefs.reminderHour, prefs.reminderMinute)) {
    return false
  }

  const slot = reminderSlotKey(prefs.reminderHour, prefs.reminderMinute)
  return prefs.lastNotifiedSlot === slot
}

export function resetDailyNotificationLock() {
  saveNotificationPrefs({ lastNotifiedDate: null, lastNotifiedSlot: null })
}

export function getDailyReminderStatus() {
  const prefs = getNotificationPrefs()
  const scheduledTime = formatReminderTime(prefs.reminderHour, prefs.reminderMinute)

  if (!prefs.enabled) {
    return { state: 'disabled', scheduledTime, message: 'Lembretes desativados.' }
  }

  if (!isNotificationSupported()) {
    return { state: 'unsupported', scheduledTime, message: 'Navegador sem suporte.' }
  }

  if (!isSecureNotificationContext()) {
    return { state: 'insecure', scheduledTime, message: 'Use localhost ou HTTPS.' }
  }

  if (getNotificationPermission() !== 'granted') {
    return { state: 'denied', scheduledTime, message: 'Permissão não concedida.' }
  }

  if (!hasPassedReminderTime(prefs.reminderHour, prefs.reminderMinute)) {
    return {
      state: 'waiting',
      scheduledTime,
      message: `Aguardando ${scheduledTime}. Mantenha o app aberto.`,
    }
  }

  if (wasAlreadyNotifiedForSlot(prefs)) {
    return {
      state: 'sent_today',
      scheduledTime,
      message: `Lembrete de hoje (${scheduledTime}) já foi enviado.`,
    }
  }

  return {
    state: 'ready',
    scheduledTime,
    message: `Horário ${scheduledTime} atingido — lembrete será enviado em instantes.`,
  }
}

export function formatReminderTime(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function msUntilNextReminder(hour, minute) {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)

  if (now >= target) return 0

  return target.getTime() - now.getTime()
}

function buildNotificationOptions(payload, tag) {
  const iconUrl = `${window.location.origin}/favicon.svg`

  return {
    body: payload.body,
    icon: iconUrl,
    badge: iconUrl,
    tag,
    data: { url: payload.url ?? '/jornada' },
    requireInteraction: false,
  }
}

export function buildNotificationPayload() {
  const session = getActiveSession()

  if (!session || isSessionCompleted(session.id)) {
    return {
      title: 'Quantum Journal',
      body: 'Inicie ou retome sua jornada de 21 dias quando estiver pronto.',
      url: '/jornada',
    }
  }

  const currentDay = Math.min(getCurrentActiveDay(session.id), 21)
  const dayStatus = getDayStatus(currentDay, session.id)
  const progress = getSessionProgress(session.id)

  if (dayStatus !== 'completed') {
    return {
      title: 'Dia pendente na sua jornada',
      body: `Seu próximo passo está esperando por você. Dia ${currentDay} ainda não foi concluído.`,
      url: `/jornada/sessao/${session.id}/dia/${currentDay}`,
    }
  }

  const motivational =
    MOTIVATIONAL_MESSAGES[progress.completedDays.length % MOTIVATIONAL_MESSAGES.length]

  return {
    ...motivational,
    body: `${motivational.body} Você já concluiu ${progress.completedDays.length} de 21 dias.`,
    url: `/jornada/sessao/${session.id}`,
  }
}

export async function showBrowserNotification(payload, { tag } = {}) {
  if (!isNotificationSupported()) {
    return { ok: false, reason: 'unsupported' }
  }

  if (!isSecureNotificationContext()) {
    return { ok: false, reason: 'insecure' }
  }

  if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'denied' }
  }

  const notificationTag = tag ?? `qj-${Date.now()}`
  const options = buildNotificationOptions(payload, notificationTag)

  try {
    const registration = await getServiceWorkerRegistration()

    if (registration?.active) {
      await registration.showNotification(payload.title, options)
      return { ok: true, via: 'serviceWorker' }
    }
  } catch {
    // fallback para Notification API da janela
  }

  try {
    const result = showWindowNotification(payload, options)
    return result
  } catch (error) {
    return {
      ok: false,
      reason: 'failed',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

function hasPassedReminderTime(hour, minute) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const reminderMinutes = hour * 60 + minute
  return currentMinutes >= reminderMinutes
}

function markNotifiedSlot(slot) {
  saveNotificationPrefs({ lastNotifiedDate: todayKey(), lastNotifiedSlot: slot })
}

export function isReminderTimeReached(hour, minute) {
  return hasPassedReminderTime(hour, minute)
}

let dailyCheckPromise = null

async function runDailyNotificationCheck() {
  const prefs = getNotificationPrefs()
  const slot = reminderSlotKey(prefs.reminderHour, prefs.reminderMinute)
  const timePassed = hasPassedReminderTime(prefs.reminderHour, prefs.reminderMinute)
  const alreadySent = prefs.lastNotifiedSlot === slot && timePassed

  if (!prefs.enabled) return { sent: false, reason: 'disabled' }
  if (!isNotificationSupported()) return { sent: false, reason: 'unsupported' }
  if (!isSecureNotificationContext()) return { sent: false, reason: 'insecure' }
  if (Notification.permission !== 'granted') return { sent: false, reason: 'denied' }
  if (!timePassed) {
    return { sent: false, reason: 'before_time' }
  }
  if (alreadySent) return { sent: false, reason: 'already_sent' }

  const payload = buildNotificationPayload()
  const result = await showBrowserNotification(payload, {
    tag: `qj-daily-${slot}`,
  })

  if (result.ok) {
    markNotifiedSlot(slot)
  }

  return result.ok
    ? { sent: true, payload, slot }
    : { sent: false, reason: result.reason ?? 'failed', error: result.error, slot }
}

export async function checkAndSendDailyNotification() {
  if (dailyCheckPromise) {
    return dailyCheckPromise
  }

  dailyCheckPromise = runDailyNotificationCheck().finally(() => {
    dailyCheckPromise = null
  })

  return dailyCheckPromise
}

export async function sendTestNotification() {
  return showBrowserNotification(
    {
      title: 'Quantum Journal',
      body: 'Notificações ativadas com sucesso. Seu lembrete diário chegará no horário escolhido.',
      url: '/configuracoes',
    },
    { tag: `qj-test-${Date.now()}` },
  )
}

export function describeNotificationResult(result) {
  if (result.ok) {
    return 'Notificação enviada. Se não aparecer, verifique as configurações de notificação do Windows e do navegador.'
  }

  switch (result.reason) {
    case 'unsupported':
      return 'Seu navegador não suporta notificações.'
    case 'insecure':
      return 'Notificações só funcionam em HTTPS ou localhost. Acesse pelo endereço local do app.'
    case 'denied':
      return 'Permissão negada. Ative nas configurações do navegador.'
    default:
      return result.error
        ? `Não foi possível enviar: ${result.error}`
        : 'Não foi possível enviar a notificação.'
  }
}

export { MOTIVATIONAL_MESSAGES }
