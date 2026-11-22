import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminPortalAuth } from '../context/useAdminPortalAuth.js'

function AdminPortalGuard() {
  const { moderator, status } = useAdminPortalAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <p className="resale-state" role="status">Checking Admin & Analytics access…</p>
  }
  if (status === 'error') {
    return <Navigate replace state={{ from: location }} to="/admin-login" />
  }
  if (!moderator) {
    return <Navigate replace state={{ from: location }} to="/admin-login" />
  }
  return <Outlet />
}

export default AdminPortalGuard
