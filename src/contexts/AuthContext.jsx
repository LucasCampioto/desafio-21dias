import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import * as authController from '../controllers/authController'
import { getToken } from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authController.getCurrentUser())
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }

    let cancelled = false

    authController
      .fetchMe()
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch(() => {
        authController.logout()
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const profile = await authController.login(email, password)
    setUser(profile)
    return profile
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const profile = await authController.signup(name, email, password)
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(() => {
    authController.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    const profile = await authController.updateProfile(updates)
    setUser(profile)
    return profile
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, loading, login, signup, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
