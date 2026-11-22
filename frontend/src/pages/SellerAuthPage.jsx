import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Lock, Mail, Phone, Store, User } from 'lucide-react'
import { WhiteMarketplaceHeader } from '../components/WhiteMarketplaceHeader.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/white-marketplace.css'

export default function SellerAuthPage({ mode: initialMode = 'login' }) {
  const navigate = useNavigate()
  const { acceptAccount } = useCustomerAuth()
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: '',
  })
  const [profileImage, setProfileImage] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function updateField(key, val) {
    setFormData((prev) => ({ ...prev, [key]: val }))
    setError('')
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid JPEG, PNG, or WebP profile image.')
      return
    }
    if (file.size > 512 * 1024) {
      setError('Profile image must be smaller than 512 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setProfileImage(reader.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (!formData.full_name.trim()) {
        setError('Please enter your full name or dealership name.')
        return
      }
      if (!formData.phone_number.trim()) {
        setError('Please enter your contact phone number.')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (!profileImage) {
        setError('Please upload a profile photo or dealership logo.')
        return
      }
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        const result = await api.customerLogin({
          email: formData.email.trim(),
          password: formData.password,
        })
        acceptAccount(result.account)
        navigate('/seller', { replace: true })
      } else {
        const result = await api.customerRegister({
          full_name: formData.full_name.trim(),
          phone_number: formData.phone_number.trim(),
          email: formData.email.trim(),
          password: formData.password,
          profile_image: profileImage,
        })
        acceptAccount(result.account)
        navigate('/seller', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="white-marketplace-theme">
      <WhiteMarketplaceHeader />

      <main style={{ maxWidth: '440px', margin: '40px auto 80px', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', marginBottom: '12px' }}>
            <Store size={28} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Seller Portal Sign In' : 'Register Seller Account'}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            {mode === 'login'
              ? 'Manage your vehicle inventory, bookings, and seller membership.'
              : 'Create your automotive seller account to publish listings across India.'}
          </p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px', boxShadow: 'var(--w-shadow-md)' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'login' ? 'var(--w-shadow-sm)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError('') }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                background: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'register' ? 'var(--w-shadow-sm)' : 'none',
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', color: '#dc2626', fontSize: '12.5px', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <>
                <div>
                  <label className="w-filter-label" style={{ marginBottom: '4px', display: 'block' }}>Seller / Dealership Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="w-filter-input"
                      style={{ width: '100%', paddingLeft: '34px' }}
                      placeholder="e.g. Apex Motors / Anand Verma"
                      value={formData.full_name}
                      onChange={(e) => updateField('full_name', e.target.value)}
                      required
                    />
                    <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  </div>
                </div>

                <div>
                  <label className="w-filter-label" style={{ marginBottom: '4px', display: 'block' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="w-filter-input"
                      style={{ width: '100%', paddingLeft: '34px' }}
                      placeholder="+91 98765 43210"
                      value={formData.phone_number}
                      onChange={(e) => updateField('phone_number', e.target.value)}
                      required
                    />
                    <Phone size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  </div>
                </div>

                <div>
                  <label className="w-filter-label" style={{ marginBottom: '4px', display: 'block' }}>Profile / Logo Photo</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="w-filter-input"
                    style={{ width: '100%', fontSize: '12px' }}
                    onChange={handleImageUpload}
                  />
                  {profileImage && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={profileImage} alt="Preview" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Photo selected</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="w-filter-label" style={{ marginBottom: '4px', display: 'block' }}>Seller Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="w-filter-input"
                  style={{ width: '100%', paddingLeft: '34px' }}
                  placeholder="seller@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                />
                <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              </div>
            </div>

            <div>
              <label className="w-filter-label" style={{ marginBottom: '4px', display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="w-filter-input"
                  style={{ width: '100%', paddingLeft: '34px' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                />
                <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="w-filter-label" style={{ marginBottom: '4px', display: 'block' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="w-filter-input"
                    style={{ width: '100%', paddingLeft: '34px' }}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    required
                  />
                  <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-btn w-btn-success"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              disabled={busy}
            >
              {busy ? 'Processing…' : mode === 'login' ? 'Sign In to Seller Portal' : 'Register Seller Account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Are you looking to buy a car instead?{' '}
            <Link to="/buyer/login" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
              Go to Buyer Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
