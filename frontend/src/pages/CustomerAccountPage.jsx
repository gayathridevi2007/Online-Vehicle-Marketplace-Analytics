import { useRef, useState } from 'react'
import { ArrowRight, KeyRound, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import CustomerHeader from '../components/CustomerHeader.jsx'
import ProfileImageCropper from '../components/ProfileImageCropper.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/customer-marketplace.css'

function CustomerAccountPage({ mode }) {
  const isRegister = mode === 'register'
  const cropperRef = useRef(null)
  const navigate = useNavigate()
  const { acceptAccount } = useCustomerAuth()
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const profileImage = isRegister ? cropperRef.current?.getImage() : null
    if (isRegister && !profileImage) {
      setError('Choose and crop a profile image before creating your account.')
      return
    }
    setSubmitting(true)
    try {
      const result = isRegister
        ? await api.customerRegister({
          ...form,
          profile_image: profileImage,
        })
        : await api.customerLogin({
          email: form.email,
          password: form.password,
        })
      acceptAccount(result.account)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Account request failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="customer-marketplace customer-account-page">
      <CustomerHeader />
      <section className="customer-account-shell">
        <div className="customer-account-intro">
          <span className="customer-eyebrow">
            <span className="customer-eyebrow-dot" />
            {isRegister ? 'YOUR DRIVE MARKET PROFILE' : 'WELCOME BACK'}
          </span>
          <h1>{isRegister ? 'Make it yours.' : 'Good to see you.'}</h1>
          <p>
            {isRegister
              ? 'Create your customer profile to save your preferences and unlock premium vehicle discovery.'
              : 'Sign in to return to your VMA Drive Market profile and premium access.'}
          </p>
          <div className="customer-account-promise">
            <KeyRound aria-hidden="true" size={17} />
            <span>Password is stored only as a salted hash. Your profile remains separate from the admin portal.</span>
          </div>
          <Link className="customer-account-back" to="/">
            Return to the marketplace <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        <form className="customer-account-form" onSubmit={handleSubmit}>
          <div className="customer-account-form-heading">
            <span className="customer-section-index">
              {isRegister ? 'CUSTOMER REGISTRATION' : 'CUSTOMER SIGN IN'}
            </span>
            <h2>{isRegister ? 'Create your account' : 'Sign in to your account'}</h2>
            <p>All fields are kept within the customer account system.</p>
          </div>

          {isRegister && (
            <>
              <label className="customer-account-field">
                <span>Full name</span>
                <input
                  autoComplete="name"
                  maxLength="120"
                  name="full_name"
                  onChange={updateField}
                  required
                  value={form.full_name}
                />
              </label>
              <label className="customer-account-field">
                <span>Phone number</span>
                <input
                  autoComplete="tel"
                  maxLength="32"
                  name="phone_number"
                  onChange={updateField}
                  placeholder="+91 98765 43210"
                  required
                  type="tel"
                  value={form.phone_number}
                />
              </label>
            </>
          )}

          <label className="customer-account-field">
            <span>Email address</span>
            <input
              autoComplete="email"
              maxLength="254"
              name="email"
              onChange={updateField}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label className="customer-account-field">
            <span>Password</span>
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              maxLength="128"
              minLength="8"
              name="password"
              onChange={updateField}
              required
              type="password"
              value={form.password}
            />
            {isRegister && <small>Use at least 8 characters.</small>}
          </label>

          {isRegister && <ProfileImageCropper ref={cropperRef} />}

          {error && <p className="account-form-error" role="alert">{error}</p>}
          <button
            className="customer-account-submit"
            disabled={submitting}
            type="submit"
          >
            {submitting
              ? 'Please wait…'
              : isRegister
                ? <><UserPlus aria-hidden="true" size={16} /> Create account</>
                : <>Sign in <ArrowRight aria-hidden="true" size={16} /></>}
          </button>
          <p className="customer-account-switch">
            {isRegister ? 'Already registered?' : 'New to VMA Drive Market?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default CustomerAccountPage
