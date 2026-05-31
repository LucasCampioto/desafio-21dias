import { ASSISTANT_CHAT_TTL_MS, STORAGE_KEYS, assistantMessagesKey } from '../lib/constants'
import { readStorage, removeStorage, writeStorage } from '../lib/utils'
import { apiFetch } from '../lib/apiClient'

function createWelcome() {
  return {
    role: 'assistant',
    content:
      'Olá. Eu sou Aurora, sua companheira nesta jornada. Estou aqui para ouvir, refletir com você e ajudar a manter seu alinhamento. Como você está se sentindo hoje?',
    at: new Date().toISOString(),
  }
}

function createFreshStore() {
  return {
    startedAt: new Date().toISOString(),
    messages: [createWelcome()],
  }
}

function isExpired(startedAt) {
  if (!startedAt) return true
  return Date.now() - new Date(startedAt).getTime() >= ASSISTANT_CHAT_TTL_MS
}

function removeLegacyStorage() {
  removeStorage(STORAGE_KEYS.ASSISTANT_MESSAGES)
}

function loadStore(userId) {
  if (!userId) return createFreshStore()

  removeLegacyStorage()

  const stored = readStorage(assistantMessagesKey(userId), null)
  if (!stored?.messages?.length || isExpired(stored.startedAt)) {
    return createFreshStore()
  }

  return stored
}

function persistStore(userId, store) {
  if (!userId) return
  writeStorage(assistantMessagesKey(userId), store)
}

export function getAssistantMessages(userId) {
  const store = loadStore(userId)
  if (userId) persistStore(userId, store)
  return store.messages
}

export function saveAssistantMessages(userId, messages) {
  const current = loadStore(userId)
  persistStore(userId, { ...current, messages })
}

export function appendMessage(userId, role, content) {
  const store = loadStore(userId)
  const next = {
    ...store,
    messages: [...store.messages, { role, content, at: new Date().toISOString() }],
  }
  persistStore(userId, next)
  return next.messages
}

export async function sendChatMessage(message, sessionId) {
  const data = await apiFetch('/assistant/chat', {
    method: 'POST',
    body: {
      message,
      ...(sessionId ? { sessionId } : {}),
    },
  })

  return data?.reply ?? data?.message ?? ''
}

export function resetAssistantMessages(userId) {
  const store = createFreshStore()
  persistStore(userId, store)
  return store.messages
}
