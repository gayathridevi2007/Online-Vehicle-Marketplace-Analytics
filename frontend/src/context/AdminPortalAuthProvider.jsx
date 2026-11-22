import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { AdminPortalAuthContext } from './AdminPortalAuthContext.js'

export function AdminPortalAuthProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',
    moderator: null,
    error: null,
  })

  const acceptModerator = useCallback((moderator) => {
    setState({ status: 'ready', moderator, error: null })
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const { moderator } = await api.marketplaceModeratorSession()
      acceptModerator(moderator)
      return moderator
    } catch (error) {
      setState({ status: 'error', moderator: null, error })
      throw error
    }
  }, [acceptModerator])

  const login = useCallback(async (credentials) => {
    const { moderator } = await api.marketplaceModeratorLogin(credentials)
    acceptModerator(moderator)
    return moderator
  }, [acceptModerator])

  const register = useCallback(async (payload) => {
    const { moderator } = await api.marketplaceModeratorRegister(payload)
    acceptModerator(moderator)
    return moderator
  }, [acceptModerator])

  const logout = useCallback(async () => {
    await api.marketplaceModeratorLogout()
    acceptModerator(null)
  }, [acceptModerator])

  useEffect(() => {
    let active = true
    api.marketplaceModeratorSession()
      .then(({ moderator }) => {
        if (active) setState({ status: 'ready', moderator, error: null })
      })
      .catch((error) => {
        if (active) setState({ status: 'error', moderator: null, error })
      })
    return () => { active = false }
  }, [])

  return (
    <AdminPortalAuthContext.Provider
      value={{ ...state, login, logout, refreshSession, register }}
    >
      {children}
    </AdminPortalAuthContext.Provider>
  )
}
