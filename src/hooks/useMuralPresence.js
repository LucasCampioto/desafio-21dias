import { useCallback, useEffect, useMemo, useState } from 'react'
import * as muralPresenceController from '../controllers/muralPresenceController'

const POLL_MS = 30_000

function pickVisibleSlot(presence) {
  if (!presence?.enabled) return null

  const candidates = presence.activeSlots?.length
    ? presence.activeSlots
    : presence.active
      ? [presence.active]
      : []

  return (
    candidates.find(
      (slot) =>
        slot?.slotId &&
        !muralPresenceController.isSlotDismissed(slot.slotId),
    ) ?? null
  )
}

export function useMuralPresence() {
  const [presence, setPresence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dismissTick, setDismissTick] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const data = await muralPresenceController.fetchMuralPresence()
      setPresence(data)
    } catch {
      setPresence({ enabled: true, active: null, activeSlots: [], nextSlotAt: null })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const intervalId = window.setInterval(refresh, POLL_MS)
    const onFocus = () => refresh()

    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  const visibleSlot = useMemo(
    () => pickVisibleSlot(presence),
    [presence, dismissTick],
  )

  const dismiss = useCallback(() => {
    if (!visibleSlot?.slotId) return
    muralPresenceController.dismissSlot(visibleSlot.slotId)
    setDismissTick((n) => n + 1)
  }, [visibleSlot?.slotId])

  return {
    loading,
    enabled: presence?.enabled !== false,
    active: visibleSlot,
    nextSlotAt: presence?.nextSlotAt ?? null,
    dismiss,
    refresh,
  }
}
