import { STORAGE_KEYS } from '../lib/constants'
import { readStorage, writeStorage, removeStorage } from '../lib/utils'
import { apiFetch, clearToken, getToken, normalizeId, setToken } from '../lib/apiClient'

function mapUser(user) {
  if (!user) return null
  const normalized = normalizeId(user)
  return {
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    muralPresenceEnabled: normalized.muralPresenceEnabled !== false,
    createdAt: normalized.createdAt ?? normalized.loggedInAt,
    loggedInAt: normalized.loggedInAt ?? normalized.createdAt,
    updatedAt: normalized.updatedAt,
  }
}

function persistUser(user) {
  if (user) {
    writeStorage(STORAGE_KEYS.AUTH_USER, user)
  } else {
    removeStorage(STORAGE_KEYS.AUTH_USER)
  }
}

function applyAuthResponse(data) {
  const token = data?.token ?? data?.accessToken
  const user = mapUser(data?.user ?? data)

  if (token) setToken(token)
  if (user?.email) persistUser(user)

  return user
}

export function getCurrentUser() {
  return readStorage(STORAGE_KEYS.AUTH_USER)
}

export async function fetchMe() {
  const data = await apiFetch('/auth/me')
  const user = mapUser(data?.user ?? data)
  persistUser(user)
  return user
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    auth: false,
    method: 'POST',
    body: { email, password },
  })

  const user = applyAuthResponse(data)
  return { ...user, loggedInAt: new Date().toISOString() }
}

export async function signup(name, email, password) {
  const data = await apiFetch('/auth/signup', {
    auth: false,
    method: 'POST',
    body: { name, email, password },
  })

  const user = applyAuthResponse(data)
  return { ...user, loggedInAt: new Date().toISOString() }
}

export async function updateProfile(updates) {
  const data = await apiFetch('/auth/me', {
    method: 'PATCH',
    body: updates,
  })

  const user = mapUser(data?.user ?? data)
  persistUser(user)
  return user
}

export function logout() {
  clearToken()
  removeStorage(STORAGE_KEYS.AUTH_USER)
  removeStorage(STORAGE_KEYS.ASSISTANT_MESSAGES)
}

export function isAuthenticated() {
  return Boolean(getToken() || getCurrentUser())
}
