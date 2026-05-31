export const STORAGE_KEYS = {
  AUTH_TOKEN: 'qj_auth_token',
  AUTH_USER: 'qj_auth_user',
  ACTIVE_SESSION: 'qj_active_session',
  SESSIONS_HISTORY: 'qj_sessions_history',
  MURAL_CARDS: 'qj_mural_cards',
  /** @deprecated chave global — migrada para assistantMessagesKey(userId) */
  ASSISTANT_MESSAGES: 'qj_assistant_messages',
  MOCK_INITIALIZED: 'qj_mock_sessions_initialized',
  NOTIFICATION_PREFS: 'qj_notification_prefs',
}

/** Histórico do assistente expira após 24h (novo chat por período). */
export const ASSISTANT_CHAT_TTL_MS = 24 * 60 * 60 * 1000

export function assistantMessagesKey(userId) {
  return `qj_assistant_messages_${userId}`
}

export const MOCK_COMPLETED_SESSION_ID = 'mock-jornada-concluida-1'

export function sessionProgressKey(sessionId) {
  return `qj_session_${sessionId}_progress`
}

export function sessionAnswersKey(sessionId, dayId) {
  return `qj_session_${sessionId}_day_${dayId}_answers`
}

export const APP_NAME = 'Quantum Journal'

export const NAV_ITEMS = [
  { to: '/mural', label: 'Mural', icon: 'solar:widget-5-linear' },
  { to: '/jornada', label: 'Jornada', icon: 'solar:map-arrow-right-linear' },
  { to: '/assistente', label: 'Assistente', icon: 'solar:chat-round-dots-linear' },
  { to: '/evolucao', label: 'Evolução', icon: 'solar:graph-up-linear' },
  { to: '/configuracoes', label: 'Configurações', icon: 'solar:settings-linear' },
]
