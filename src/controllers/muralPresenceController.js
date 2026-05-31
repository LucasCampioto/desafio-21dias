import { apiFetch } from '../lib/apiClient'

const DISMISS_PREFIX = 'qj_mural_presence_dismissed_'

export function isSlotDismissed(slotId) {
  if (!slotId || typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(`${DISMISS_PREFIX}${slotId}`) === '1'
}

export function dismissSlot(slotId) {
  if (!slotId || typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(`${DISMISS_PREFIX}${slotId}`, '1')
}

export async function fetchMuralPresence() {
  return apiFetch('/mural/presence')
}
