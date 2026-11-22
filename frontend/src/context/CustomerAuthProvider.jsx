import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { CustomerAuthContext } from './CustomerAuthContext.js'

function CustomerAuthProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',
    account: null,
    error: null,
  })

  const acceptAccount = useCallback((account) => {
    setState({ status: 'ready', account, error: null })
  }, [])

  const refreshAccount = useCallback(async () => {
    try {
      const { account } = await api.customerMe()
      acceptAccount(account)
      return account
    } catch (error) {
      setState({ status: 'error', account: null, error })
      throw error
    }
  }, [acceptAccount])

  const logout = useCallback(async () => {
    await api.customerLogout()
    acceptAccount(null)
  }, [acceptAccount])

  useEffect(() => {
    let active = true
    api.customerMe()
      .then(({ account }) => {
        if (active) setState({ status: 'ready', account, error: null })
      })
      .catch((error) => {
        if (active) setState({ status: 'error', account: null, error })
      })
    return () => { active = false }
  }, [])

  return (
    <CustomerAuthContext.Provider
      value={{
        ...state,
        acceptAccount,
        refreshAccount,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export default CustomerAuthProvider
