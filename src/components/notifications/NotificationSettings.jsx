import { useState, useCallback, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Card from '../../design-system/Card'
import Button from '../../design-system/Button'
import * as notificationController from '../../controllers/notificationController'
import { cn } from '../../lib/utils'

function formatTime(hour, minute) {
  return notificationController.formatReminderTime(hour, minute)
}

export default function NotificationSettings() {
  const supported = notificationController.isNotificationSupported()
  const secureContext = notificationController.isSecureNotificationContext()
  const [prefs, setPrefs] = useState(() => notificationController.getNotificationPrefs())
  const [permission, setPermission] = useState(() =>
    notificationController.getNotificationPermission(),
  )
  const [reminderStatus, setReminderStatus] = useState(() =>
    notificationController.getDailyReminderStatus(),
  )
  const [message, setMessage] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const refreshStatus = useCallback(() => {
    setPermission(notificationController.getNotificationPermission())
    setReminderStatus(notificationController.getDailyReminderStatus())
  }, [])

  useEffect(() => {
    notificationController.warmUpNotificationService()
    refreshStatus()

    const intervalId = window.setInterval(refreshStatus, 15_000)
    const onPrefsChange = () => refreshStatus()

    window.addEventListener('qj-notification-prefs-changed', onPrefsChange)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('qj-notification-prefs-changed', onPrefsChange)
    }
  }, [refreshStatus])

  const handleToggle = async () => {
    setMessage('')

    if (!supported) {
      setMessage('Seu navegador não suporta notificações.')
      return
    }

    if (!secureContext) {
      setMessage('Notificações só funcionam em HTTPS ou localhost.')
      return
    }

    if (prefs.enabled) {
      const next = { ...prefs, enabled: false }
      notificationController.saveNotificationPrefs(next)
      setPrefs(next)
      refreshStatus()
      setMessage('Lembretes desativados.')
      return
    }

    const result = await notificationController.requestNotificationPermission()
    refreshStatus()

    if (result !== 'granted') {
      setMessage(
        result === 'insecure'
          ? 'Notificações só funcionam em HTTPS ou localhost.'
          : 'Permissão negada. Ative nas configurações do navegador para receber lembretes.',
      )
      return
    }

    notificationController.resetDailyNotificationLock()

    const next = { ...prefs, enabled: true }
    notificationController.saveNotificationPrefs(next)
    setPrefs(next)

    const testResult = await notificationController.sendTestNotification()
    refreshStatus()
    setMessage(notificationController.describeNotificationResult(testResult))
  }

  const handleTimeChange = async (event) => {
    const [hour, minute] = event.target.value.split(':').map(Number)
    notificationController.resetDailyNotificationLock()

    const next = { ...prefs, reminderHour: hour, reminderMinute: minute }
    notificationController.saveNotificationPrefs(next)
    setPrefs(next)

    if (next.enabled && notificationController.isReminderTimeReached(hour, minute)) {
      const result = await notificationController.checkAndSendDailyNotification()
      refreshStatus()

      if (result.sent) {
        setMessage(`Lembrete diário enviado para ${formatTime(hour, minute)}.`)
        return
      }
    }

    refreshStatus()
    setMessage('Horário atualizado. O lembrete será enviado nesse horário com o app aberto.')
  }

  const handleTest = async () => {
    setMessage('')
    setIsTesting(true)

    const currentPermission = notificationController.getNotificationPermission()
    refreshStatus()

    if (currentPermission !== 'granted') {
      setMessage('Conceda permissão antes de testar.')
      setIsTesting(false)
      return
    }

    const result = await notificationController.sendTestNotification()
    setMessage(notificationController.describeNotificationResult(result))
    setIsTesting(false)
  }

  return (
    <Card variant="panel">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900/5">
          <Icon icon="solar:bell-linear" width={22} className="text-stone-700" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl text-stone-900">Lembretes do navegador</h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            Opcional. Receba um lembrete diário na barra de notificações do seu dispositivo — se
            você autorizar.
          </p>
        </div>
      </div>

      {!supported && (
        <p className="mt-4 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
          Notificações não são suportadas neste navegador.
        </p>
      )}

      {supported && !secureContext && (
        <p className="mt-4 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
          Acesse o app por <strong>localhost:5174</strong> para habilitar notificações neste
          dispositivo.
        </p>
      )}

      {supported && secureContext && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-stone-800">Ativar lembretes</p>
              <p className="text-xs text-stone-500">
                Status:{' '}
                {permission === 'granted'
                  ? 'Permitido'
                  : permission === 'denied'
                    ? 'Bloqueado'
                    : 'Aguardando permissão'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.enabled}
              onClick={handleToggle}
              className={cn(
                'inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
                prefs.enabled ? 'bg-lime' : 'bg-stone-300',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
                  prefs.enabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">
              Horário do lembrete
            </span>
            <input
              type="time"
              value={formatTime(prefs.reminderHour, prefs.reminderMinute)}
              onChange={handleTimeChange}
              disabled={!prefs.enabled}
              className="rounded-full border border-stone-300 bg-white/70 px-4 py-2.5 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-stone-900/10 disabled:opacity-50"
            />
          </label>

          {prefs.enabled && permission === 'granted' && (
            <p className="rounded-2xl bg-stone-100 px-4 py-3 text-xs leading-relaxed text-stone-600">
              {reminderStatus.message}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTest}
              disabled={permission !== 'granted' || isTesting}
            >
              {isTesting ? 'Enviando…' : 'Testar notificação'}
            </Button>
          </div>

          <p className="text-xs leading-relaxed text-stone-500">
            O lembrete diário só dispara com o app aberto (aba ou PWA). No Windows, confira também
            Configurações → Sistema → Notificações.
          </p>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
    </Card>
  )
}
