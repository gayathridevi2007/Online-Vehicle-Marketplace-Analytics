import { useContext } from 'react'
import { AdminPortalAuthContext } from './AdminPortalAuthContext.js'

export function useAdminPortalAuth() {
  const context = useContext(AdminPortalAuthContext)
  if (!context) {
    throw new Error('useAdminPortalAuth must be used inside AdminPortalAuthProvider.')
  }
  return context
}
