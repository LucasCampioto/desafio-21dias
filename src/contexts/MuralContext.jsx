import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import * as muralController from '../controllers/muralController'
import { useAuth } from './AuthContext'

const MuralContext = createContext(null)

export function MuralProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      muralController.clearMuralCache()
      setCards([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nextCards = await muralController.loadMuralCards()
      setCards(nextCards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o mural.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addCard = useCallback(
    async (text) => {
      const card = await muralController.createCard(text)
      setCards(muralController.getMuralCards())
      return card
    },
    [],
  )

  const updateCard = useCallback(async (id, updates) => {
    await muralController.updateCard(id, updates)
    setCards(muralController.getMuralCards())
  }, [])

  const removeCard = useCallback(async (id) => {
    await muralController.deleteCard(id)
    setCards(muralController.getMuralCards())
  }, [])

  const value = useMemo(
    () => ({ cards, loading, error, addCard, updateCard, removeCard, refresh }),
    [cards, loading, error, addCard, updateCard, removeCard, refresh],
  )

  return <MuralContext.Provider value={value}>{children}</MuralContext.Provider>
}

export function useMural() {
  const ctx = useContext(MuralContext)
  if (!ctx) throw new Error('useMural must be used within MuralProvider')
  return ctx
}
