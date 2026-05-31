import { useEffect, useRef } from 'react'
import * as notificationController from '../../controllers/notificationController'

const CHECK_INTERVAL_MS = 15_000

export default function BrowserNotificationScheduler() {
  const timeoutRef = useRef(null)

  useEffect(() => {
    notificationController.warmUpNotificationService()

    const runCheck = () => {
      void notificationController.checkAndSendDailyNotification()
    }

    const scheduleExactReminder = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      const prefs = notificationController.getNotificationPrefs()
      if (!prefs.enabled) return

      const delayMs = notificationController.msUntilNextReminder(
        prefs.reminderHour,
        prefs.reminderMinute,
      )

      if (delayMs <= 0) {
        runCheck()
        return
      }

      timeoutRef.current = window.setTimeout(() => {
        runCheck()
        scheduleExactReminder()
      }, delayMs + 500)
    }

    runCheck()
    scheduleExactReminder()

    const intervalId = window.setInterval(runCheck, CHECK_INTERVAL_MS)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runCheck()
        scheduleExactReminder()
      }
    }

    const onPrefsChange = () => {
      runCheck()
      scheduleExactReminder()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('qj-notification-prefs-changed', onPrefsChange)

    return () => {
      window.clearInterval(intervalId)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('qj-notification-prefs-changed', onPrefsChange)
    }
  }, [])

  return null
}
