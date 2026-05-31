import { STORAGE_KEYS } from './constants'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getApiUrl() {
  return API_URL
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
}

export function normalizeId(value) {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(normalizeId)
  if (typeof value !== 'object') return value

  const { _id, id, ...rest } = value
  const normalized = { ...rest, id: id ?? _id }

  for (const key of Object.keys(normalized)) {
    if (normalized[key] && typeof normalized[key] === 'object') {
      normalized[key] = normalizeId(normalized[key])
    }
  }

  return normalized
}

async function parseResponseBody(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiFetch(path, options = {}) {
  const { auth = true, body, headers: customHeaders, ...fetchOptions } = options

  const headers = {
    Accept: 'application/json',
    ...customHeaders,
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `Request failed (${response.status})`
    throw new ApiError(message, response.status, data)
  }

  return data
}
