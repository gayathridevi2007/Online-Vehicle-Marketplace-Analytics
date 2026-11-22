import { LogOut, Menu, PanelLeftClose } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAdminPortalAuth } from '../context/useAdminPortalAuth.js'
import { NAV_ITEMS } from '../navigation.js'

function Header({ onToggleSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { moderator, logout } = useAdminPortalAuth()
  const [logoutError, setLogoutError] = useState('')
  const currentPage = NAV_ITEMS.find((item) => item.path === location.pathname)

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
      navigate('/admin-login', { replace: true })
    } catch (error) {
      setLogoutError(error.message || 'Staff sign-out failed.')
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button
          aria-label="Toggle sidebar"
          className="icon-button sidebar-toggle"
          onClick={onToggleSidebar}
          type="button"
        >
          <Menu className="mobile-menu-icon" size={19} />
          <PanelLeftClose className="desktop-menu-icon" size={19} />
        </button>
        <div className="topbar-title">
          <span className="topbar-kicker">DATA WAREHOUSE & DATA MINING</span>
          <span className="topbar-current">{currentPage?.label || 'Page not found'}</span>
        </div>
      </div>
      <div className="topbar-trailing">
        <span className="workspace-pill"><span className="status-dot" /> Student project</span>
        <Link className="topbar-customer-link" to="/">Customer Marketplace</Link>
        {moderator && (
          <button className="topbar-signout" onClick={handleLogout} type="button">
            <span>{moderator.email}</span><LogOut aria-hidden="true" size={14} />
          </button>
        )}
        {logoutError && <span className="topbar-logout-error" role="alert">{logoutError}</span>}
      </div>
    </header>
  )
}

export default Header
