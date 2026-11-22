import { useState } from 'react'
import { ArrowRight, CarFront, ShieldCheck, UserPlus } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminPortalAuth } from '../context/useAdminPortalAuth.js'
import '../styles/customer-marketplace.css'
import '../styles/resale-marketplace.css'
import '../styles/admin-login-panel.css'

function AdminPortalLoginPage() {
  const { error: sessionError, login, moderator, refreshSession, register, status } = useAdminPortalAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    invitationCode: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (status === 'loading') {
    return <main className="customer-marketplace"><p className="resale-state" role="status">Checking staff access…</p></main>
  }
  if (status === 'ready' && moderator) {
    return <Navigate replace to={location.state?.from?.pathname || '/admin'} />
  }

  async function submit(event) {
    event.preventDefault()
    setError('')

    if (mode === 'register') {
      if (credentials.password.length < 14) {
        setError('Staff password must be at least 14 characters long.')
        return
      }
      if (credentials.password !== credentials.confirmPassword) {
        setError('The confirmation password does not match.')
        return
      }
      if (!credentials.invitationCode.trim()) {
        setError('Please enter the owner authorization passcode.')
        return
      }
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        await login({ email: credentials.email, password: credentials.password })
      } else {
        await register({
          email: credentials.email,
          password: credentials.password,
          invitation_code: credentials.invitationCode.trim(),
        })
      }
      navigate(location.state?.from?.pathname || '/admin', { replace: true })
    } catch (requestError) {
      setError(requestError.message || (mode === 'login' ? 'Staff sign-in failed.' : 'Administrator provisioning failed.'))
    } finally {
      setBusy(false)
    }
  }

  async function retrySession() {
    setError('')
    try {
      await refreshSession()
    } catch (requestError) {
      setError(requestError.message || 'Staff authentication is unavailable.')
    }
  }

  return (
    <main className="white-marketplace-theme admin-login-page">
      <header className="customer-header admin-login-header">
        <Link aria-label="VMA home" className="customer-brand" to="/">
          <span className="customer-brand-mark"><CarFront aria-hidden="true" size={22} /></span>
          <span className="customer-brand-copy"><strong>VMA</strong><small>ADMIN & ANALYTICS</small></span>
        </Link>
        <Link className="customer-auth-link" to="/">Customer Marketplace</Link>
      </header>
      <div className="resale-review-shell">
        <form className="resale-review-login admin-login-card" onSubmit={submit}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span className="customer-eyebrow"><span className="customer-eyebrow-dot" /> SEPARATE STAFF ACCESS</span>
            <div style={{ display: 'flex', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                style={{
                  background: mode === 'login' ? 'rgba(98, 220, 233, 0.2)' : 'transparent',
                  color: mode === 'login' ? '#62dce9' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                style={{
                  background: mode === 'register' ? 'rgba(98, 220, 233, 0.2)' : 'transparent',
                  color: mode === 'register' ? '#62dce9' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Create Admin Account
              </button>
            </div>
          </div>

          <h1>{mode === 'login' ? 'Admin & Analytics Sign In' : 'Create Administrator Account'}</h1>
          <p>
            {mode === 'login'
              ? 'Sign in with an authorized marketplace moderator account to access listing verification, transaction monitoring, analytics, and warehouse tools.'
              : 'Provision a new administrator account with owner authorization. All staff access requires verification and is strictly isolated from customer accounts.'}
          </p>

          <div className="admin-staff-auth-box" style={{ background: 'rgba(98, 220, 233, 0.08)', border: '1px solid rgba(98, 220, 233, 0.25)', borderRadius: '6px', padding: '10px 12px', margin: '10px 0 16px', fontSize: '11px', color: '#bfeef1', lineHeight: '1.5' }}>
            <strong>Staff Authentication:</strong> Customer marketplace credentials cannot sign in here.
            {mode === 'register'
              ? ' Enter the owner authorization passcode (e.g. VMA-ADMIN-2026-STAFF) to create and verify your administrator privileges.'
              : ' Use your provisioned staff credentials (e.g. admin@vma.local) or switch to "Create Admin Account" with your owner passcode.'}
          </div>

          <div className="resale-moderator-form">
            <label className="resale-field">
              <span>Staff Email</span>
              <input
                autoComplete="username"
                onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
                placeholder="staff@vma.local"
                required
                type="email"
                value={credentials.email}
              />
            </label>

            <label className="resale-field">
              <span>{mode === 'login' ? 'Password' : 'Password (minimum 14 characters)'}</span>
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••••••••••"
                required
                type="password"
                value={credentials.password}
              />
            </label>

            {mode === 'register' && (
              <>
                <label className="resale-field">
                  <span>Confirm Password</span>
                  <input
                    autoComplete="new-password"
                    onChange={(event) => setCredentials((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="••••••••••••••••"
                    required
                    type="password"
                    value={credentials.confirmPassword}
                  />
                </label>

                <label className="resale-field">
                  <span>Owner Authorization Passcode</span>
                  <input
                    autoComplete="off"
                    onChange={(event) => setCredentials((current) => ({ ...current, invitationCode: event.target.value }))}
                    placeholder="VMA-ADMIN-2026-STAFF"
                    required
                    type="password"
                    value={credentials.invitationCode}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '10px', marginTop: '3px' }}>
                    Passcode configured by project owner in backend configuration to prevent unauthorized admin creation.
                  </small>
                </label>
              </>
            )}

            {(error || (status === 'error' && sessionError)) && (
              <p className="resale-form-error" role="alert">
                {error || sessionError?.message || 'Staff authentication is unavailable.'}
                {status === 'error' && (
                  <button className="resale-quiet-button admin-retry-button" onClick={retrySession} type="button">Retry</button>
                )}
              </p>
            )}

            <button className="resale-primary-link" disabled={busy} type="submit">
              {mode === 'login' ? <ShieldCheck aria-hidden="true" size={16} /> : <UserPlus aria-hidden="true" size={16} />}
              {busy ? (mode === 'login' ? 'Signing in…' : 'Provisioning…') : (mode === 'login' ? 'Sign in to Admin & Analytics' : 'Create & Access Admin Portal')}
              <ArrowRight aria-hidden="true" size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
            <span>
              {mode === 'login' ? "Need staff access? " : "Already provisioned? "}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#62dce9', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit' }}
              >
                {mode === 'login' ? "Create Admin Account" : "Sign In"}
              </button>
            </span>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Return to Marketplace</Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default AdminPortalLoginPage
