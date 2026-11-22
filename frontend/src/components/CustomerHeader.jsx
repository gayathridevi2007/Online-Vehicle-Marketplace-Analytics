import { useState } from 'react'
import { CarFront, Crown, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'

function initials(name) {
  return (name || 'VMA')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function CustomerHeader() {
  const { account, logout, status } = useCustomerAuth()
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
    } catch (error) {
      setLogoutError(error.message || 'Sign out failed. Please retry.')
    }
  }

  return (
    <header className="customer-header">
      <Link aria-label="VMA Drive Market home" className="customer-brand" to="/">
        <span className="customer-brand-mark"><CarFront aria-hidden="true" size={23} /></span>
        <span className="customer-brand-copy">
          <strong>VMA</strong>
          <small>DRIVE MARKET</small>
        </span>
      </Link>

      <nav aria-label="Marketplace navigation" className="customer-nav">
        <Link to="/#resale-marketplace">Browse cars</Link>
        <Link to="/#vehicle-catalogue">Vehicle data</Link>
        <Link to="/sell-car">Sell your car</Link>
        <Link to="/my-listings">My listings</Link>
        <Link to="/my-purchases">Purchases</Link>
      </nav>

      <div className="customer-header-actions">
        {status === 'loading'
          ? <span className="customer-auth-loading" aria-label="Loading customer account" />
          : account
            ? (
              <>
                <Link
                  aria-label={`${account.full_name}, ${account.account_status} account`}
                  className="customer-account-link"
                  to="/premium"
                >
                  {account.profile_image
                    ? <img alt="" className="customer-account-avatar" src={account.profile_image} />
                    : <span className="customer-account-avatar customer-account-initials">{initials(account.full_name)}</span>}
                  <span className="customer-account-copy">
                    <strong>{account.full_name}</strong>
                    <small className={account.account_status === 'premium' ? 'is-premium' : ''}>
                      {account.account_status === 'premium' && <Crown aria-hidden="true" size={11} />}
                      {account.account_status === 'premium' ? 'Premium' : 'Free account'}
                    </small>
                  </span>
                </Link>
                <button
                  aria-label="Sign out"
                  className="customer-signout-button"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut aria-hidden="true" size={14} />
                </button>
              </>
            )
            : (
              <>
                <Link className="customer-auth-link" to="/login">
                  <UserRound aria-hidden="true" size={14} />
                  <span>Sign in</span>
                </Link>
                <Link className="customer-register-link" to="/register">
                  Create account
                </Link>
              </>
            )}
        <Link aria-label="Admin and Analytics sign in" className="customer-admin-link" to="/admin-login">
          <ShieldCheck aria-hidden="true" size={16} />
          <span>Admin & Analytics</span>
        </Link>
      </div>
      {logoutError && <span className="customer-logout-error" role="alert">{logoutError}</span>}
    </header>
  )
}

export default CustomerHeader
