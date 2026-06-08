import { apiFetch, normalizeId } from '../lib/apiClient'

const DEFAULT_CARD_SIZE = { width: 192, height: 120 }

const DEFAULT_CARDS = [
  { id: '1', text: 'Eu tenho sucesso', color: '#D4F268', x: 40, y: 60, fontSize: 16, ...DEFAULT_CARD_SIZE },
  { id: '2', text: 'Eu sou abundante', color: '#EBC8D6', x: 220, y: 120, fontSize: 18, ...DEFAULT_CARD_SIZE },
  {
    id: '3',
    text: 'Eu construo empresas multimilionárias',
    color: '#C4C9D9',
    x: 80,
    y: 240,
    fontSize: 15,
    ...DEFAULT_CARD_SIZE,
  },
]

let cache = []

function mapCard(card) {
  const normalized = normalizeId(card)
  return {
    id: normalized.id,
    text: normalized.text,
    color: normalized.color,
    x: normalized.x,
    y: normalized.y,
    fontSize: normalized.fontSize,
    width: normalized.width ?? DEFAULT_CARD_SIZE.width,
    height: normalized.height ?? DEFAULT_CARD_SIZE.height,
  }
}

function extractCards(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.cards)) return data.cards
  return []
}

export function getMuralCards() {
  return cache
}

export function applyLocalCardUpdate(id, updates) {
  cache = cache.map((card) => (card.id === id ? { ...card, ...updates } : card))
}

export async function loadMuralCards() {
  try {
    const data = await apiFetch('/mural/cards')
    cache = extractCards(data).map(mapCard)
  } catch (error) {
    if (error.status === 404) {
      cache = DEFAULT_CARDS
      return cache
    }
    throw error
  }

  return cache
}

export async function createCard(text = 'Nova afirmação') {
  const cardPayload = {
    text,
    color: '#FBFCD4',
    x: 100 + Math.random() * 200,
    y: 80 + Math.random() * 200,
    fontSize: 16,
    width: DEFAULT_CARD_SIZE.width,
    height: DEFAULT_CARD_SIZE.height,
  }

  const data = await apiFetch('/mural/cards', {
    method: 'POST',
    body: cardPayload,
  })

  const card = mapCard(data?.card ?? data)
  cache = [...cache, card]
  return card
}

export async function updateCard(id, updates) {
  const data = await apiFetch(`/mural/cards/${id}`, {
    method: 'PUT',
    body: updates,
  })

  const existing = getMuralCards().find((card) => card.id === id)
  const updated = mapCard(data?.card ?? data ?? { ...existing, ...updates })
  cache = cache.map((card) => (card.id === id ? { ...card, ...updated } : card))
  return cache
}

export async function deleteCard(id) {
  await apiFetch(`/mural/cards/${id}`, { method: 'DELETE' })
  cache = cache.filter((card) => card.id !== id)
}

export function clearMuralCache() {
  cache = []
}
