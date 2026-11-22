import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CarFront,
  Check,
  CheckCircle2,
  FileCheck,
  FileText,
  ImagePlus,
  Info,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CustomerHeader from '../components/CustomerHeader.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/resale-marketplace.css'
import '../styles/customer-marketplace.css'

const EMPTY_FORM = {
  brand: '',
  model: '',
  manufacturing_year: '',
  fuel_type: 'Petrol',
  transmission: 'Manual',
  kilometres_driven: '',
  asking_price: '',
  price_currency: 'INR',
  location: '',
  description: '',
}

const STEPS = [
  { id: 1, label: 'Vehicle Info', title: 'Vehicle Information' },
  { id: 2, label: 'Technical Specs', title: 'Technical Specifications' },
  { id: 3, label: 'Pricing', title: 'Price & Currency' },
  { id: 4, label: 'Location & Details', title: 'Location & Description' },
  { id: 5, label: 'Car Photos', title: 'Vehicle Photographs' },
  { id: 6, label: 'Documents', title: 'Ownership Documents' },
  { id: 7, label: 'Review & Submit', title: 'Review & Submit Listing' },
]

const MAX_PHOTOS = 8
const MIN_PHOTOS = 2
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_TOTAL_BYTES = 24 * 1024 * 1024
const MAX_OWNERSHIP_DOCUMENTS = 5
const MAX_OWNERSHIP_DOCUMENT_BYTES = 5 * 1024 * 1024
const MAX_TOTAL_OWNERSHIP_DOCUMENT_BYTES = 15 * 1024 * 1024
const CURRENT_YEAR = new Date().getFullYear()

const POPULAR_BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Mahindra',
  'Volkswagen', 'Ford', 'Renault', 'Kia', 'Skoda', 'BMW', 'Audi', 'Mercedes-Benz',
]

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG']
const TRANSMISSIONS = ['Manual', 'Automatic']

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function CustomerListingFormPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { account, status: authStatus } = useCustomerAuth()
  const isEditing = Boolean(listingId)

  const [step, setStep] = useState(1)
  const [values, setValues] = useState(EMPTY_FORM)
  const [existingPhotos, setExistingPhotos] = useState([])
  const [existingOwnershipDocuments, setExistingOwnershipDocuments] = useState(0)
  const [photos, setPhotos] = useState([])
  const [ownershipDocuments, setOwnershipDocuments] = useState([])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const photoPreviews = useMemo(() => {
    return photos.map((file) => ({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }))
  }, [photos])

  useEffect(() => {
    return () => {
      photoPreviews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [photoPreviews])

  useEffect(() => {
    if (!isEditing || !account) return undefined
    let active = true
    api.marketplaceMyListings()
      .then(({ listings }) => {
        const listing = listings.find((item) => item.id === Number(listingId))
        if (!listing) {
          throw new Error('This listing is not available in your account.')
        }
        if (active) {
          setValues({
            brand: listing.brand,
            model: listing.model,
            manufacturing_year: String(listing.manufacturing_year),
            fuel_type: listing.fuel_type || 'Petrol',
            transmission: listing.transmission || 'Manual',
            kilometres_driven: String(listing.kilometres_driven),
            asking_price: listing.asking_price,
            price_currency: listing.price_currency || 'INR',
            description: listing.description || '',
            location: listing.location || '',
          })
          setExistingPhotos(listing.photo_ids || [])
          setExistingOwnershipDocuments(listing.ownership_document_ids?.length || 0)
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Listing could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [account, isEditing, listingId])

  function updateField(name, value) {
    setValues((current) => ({
      ...current,
      [name]: name === 'price_currency' ? value.toUpperCase().slice(0, 3) : value,
    }))
    setError('')
  }

  // Cumulative photo adding
  function handleAddPhotos(event) {
    const incoming = Array.from(event.target.files || [])
    if (!incoming.length) return
    event.target.value = ''

    const validFiles = []
    for (const file of incoming) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Please upload JPEG, PNG, or WebP.`)
        return
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setError(`"${file.name}" exceeds the 5 MB per photo limit.`)
        return
      }
      validFiles.push(file)
    }

    const combined = [...photos, ...validFiles]
    if (combined.length > MAX_PHOTOS) {
      setError(`You can upload at most ${MAX_PHOTOS} photos. You currently have ${photos.length}.`)
      return
    }

    const totalBytes = combined.reduce((sum, p) => sum + p.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError('Combined photos exceed the 24 MB total limit.')
      return
    }

    setError('')
    setPhotos(combined)
  }

  function handleRemovePhoto(index) {
    setPhotos((current) => current.filter((_, i) => i !== index))
  }

  function handleReplacePhoto(index, event) {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(`"${file.name}" is not a supported format. Please upload JPEG, PNG, or WebP.`)
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError(`"${file.name}" exceeds 5 MB.`)
      return
    }

    const updated = [...photos]
    updated[index] = file
    const totalBytes = updated.reduce((sum, p) => sum + p.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError('Combined photos exceed 24 MB.')
      return
    }

    setError('')
    setPhotos(updated)
  }

  // Ownership documents handling
  function handleAddDocuments(event) {
    const incoming = Array.from(event.target.files || [])
    if (!incoming.length) return
    event.target.value = ''

    const validFiles = []
    for (const file of incoming) {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(`"${file.name}" is not supported. Please upload PDF, JPEG, PNG, or WebP documents.`)
        return
      }
      if (file.size > MAX_OWNERSHIP_DOCUMENT_BYTES) {
        setError(`"${file.name}" exceeds 5 MB.`)
        return
      }
      validFiles.push(file)
    }

    const combined = [...ownershipDocuments, ...validFiles]
    if (combined.length > MAX_OWNERSHIP_DOCUMENTS) {
      setError(`You can upload at most ${MAX_OWNERSHIP_DOCUMENTS} ownership documents.`)
      return
    }

    const totalBytes = combined.reduce((sum, d) => sum + d.size, 0)
    if (totalBytes > MAX_TOTAL_OWNERSHIP_DOCUMENT_BYTES) {
      setError('Ownership documents exceed the 15 MB total limit.')
      return
    }

    setError('')
    setOwnershipDocuments(combined)
  }

  function handleRemoveDocument(index) {
    setOwnershipDocuments((current) => current.filter((_, i) => i !== index))
  }

  // Validate current step before advancing
  function validateCurrentStep() {
    setError('')
    if (step === 1) {
      if (!values.brand.trim()) {
        setError('Please enter or select a vehicle brand.')
        return false
      }
      if (!values.model.trim()) {
        setError('Please enter the vehicle model name.')
        return false
      }
      const year = Number(values.manufacturing_year)
      if (!year || year < 1886 || year > CURRENT_YEAR) {
        setError(`Please enter a valid manufacturing year between 1886 and ${CURRENT_YEAR}.`)
        return false
      }
    } else if (step === 2) {
      if (!values.fuel_type) {
        setError('Please select a fuel type.')
        return false
      }
      if (!values.transmission) {
        setError('Please select a transmission type.')
        return false
      }
      const km = Number(values.kilometres_driven)
      if (isNaN(km) || km < 0) {
        setError('Please enter a valid positive number for kilometres driven.')
        return false
      }
    } else if (step === 3) {
      const price = Number(values.asking_price)
      if (!price || price <= 0) {
        setError('Please enter a valid asking price greater than zero.')
        return false
      }
      if (!values.price_currency || values.price_currency.length !== 3) {
        setError('Please enter a valid 3-letter currency code (e.g. INR, USD, EUR).')
        return false
      }
    } else if (step === 4) {
      if (!values.location.trim()) {
        setError('Please enter the vehicle location (e.g. Bangalore, Karnataka).')
        return false
      }
      if (!values.description.trim() || values.description.trim().length < 15) {
        setError('Please provide a descriptive overview (at least 15 characters).')
        return false
      }
    } else if (step === 5) {
      if (!isEditing && photos.length < MIN_PHOTOS) {
        setError(`Please upload at least ${MIN_PHOTOS} actual vehicle photos before proceeding.`)
        return false
      }
      if (isEditing && existingPhotos.length === 0 && photos.length < MIN_PHOTOS) {
        setError(`Please upload at least ${MIN_PHOTOS} actual vehicle photos before proceeding.`)
        return false
      }
    } else if (step === 6) {
      if (!isEditing && ownershipDocuments.length === 0) {
        setError('Please upload at least one ownership document for moderator verification.')
        return false
      }
      if (isEditing && existingOwnershipDocuments === 0 && ownershipDocuments.length === 0) {
        setError('Please upload at least one ownership document for moderator verification.')
        return false
      }
    }
    return true
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setStep((current) => Math.min(current + 1, STEPS.length))
    }
  }

  function handleBack() {
    setError('')
    setStep((current) => Math.max(current - 1, 1))
  }

  async function handleFinalSubmit(event) {
    event.preventDefault()
    if (!validateCurrentStep()) return

    setSaving(true)
    setError('')

    // Programmatically construct FormData ensuring every file in state is attached
    const formData = new FormData()
    formData.append('brand', values.brand.trim())
    formData.append('model', values.model.trim())
    formData.append('manufacturing_year', String(values.manufacturing_year))
    formData.append('fuel_type', values.fuel_type)
    formData.append('transmission', values.transmission)
    formData.append('kilometres_driven', String(values.kilometres_driven))
    formData.append('asking_price', String(values.asking_price))
    formData.append('price_currency', values.price_currency.toUpperCase())
    formData.append('location', values.location.trim())
    formData.append('description', values.description.trim())

    // Append every photo file
    photos.forEach((file) => {
      formData.append('photos', file, file.name)
    })

    // Append every ownership document
    ownershipDocuments.forEach((doc) => {
      formData.append('ownership_documents', doc, doc.name)
    })

    try {
      const result = isEditing
        ? await api.marketplaceUpdateListing(listingId, formData)
        : await api.marketplaceCreateListing(formData)

      navigate('/my-listings', {
        replace: true,
        state: {
          notice: isEditing
            ? 'Your updated listing was submitted for moderator verification.'
            : 'Your vehicle was submitted successfully! A moderator will review the listing and ownership documents.',
          listingId: result.listing.id,
        },
      })
    } catch (requestError) {
      setError(requestError.message || 'Submission failed. Please check inputs and retry.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="customer-marketplace">
      <CustomerHeader />

      <div className="resale-page-shell" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link to="/my-listings" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}>
              <ArrowLeft size={14} /> My Listings
            </Link>
            <span style={{ color: '#94a3b8' }}>/</span>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>{isEditing ? 'Edit Vehicle' : 'Sell Your Car'}</span>
          </div>
          <span className="customer-eyebrow"><span className="customer-eyebrow-dot" /> CUSTOMER RESALE MARKETPLACE</span>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '6px 0' }}>
            {isEditing ? 'Update Vehicle Submission' : 'List Your Vehicle For Resale'}
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
            Complete the 7 verified steps below. Upload genuine car photographs and private ownership documentation for staff verification.
          </p>
        </div>

        {/* Authentication Gate */}
        {authStatus === 'loading' && <p className="resale-state" role="status">Checking customer session…</p>}
        {authStatus === 'ready' && !account && (
          <div className="resale-locked-card" style={{ padding: '32px', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)' }}>
            <CarFront size={44} style={{ color: '#2563eb', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>Customer Account Required</h3>
            <p style={{ color: '#475569', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
              You must be signed in to submit and manage vehicle resale listings.
            </p>
            <Link className="resale-primary-link" to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
              Sign in to Continue <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {account && loading && <p className="resale-state" role="status">Loading vehicle details…</p>}

        {account && !loading && (
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            {/* Step Progress Tracker */}
            <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', background: 'rgba(11, 19, 35, 0.95)', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#62dce9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step {step} of {STEPS.length}: {STEPS[step - 1].title}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {Math.round((step / STEPS.length) * 100)}% Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '4px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ width: `${(step / STEPS.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #62dce9)', transition: 'width 0.3s ease' }} />
              </div>

              {/* Step Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {STEPS.map((s) => {
                  const isActive = s.id === step
                  const isDone = s.id < step
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (isDone || s.id === step) setStep(s.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: isDone ? 'pointer' : 'default',
                        background: isActive
                          ? 'rgba(98, 220, 233, 0.2)'
                          : isDone
                            ? 'rgba(37, 99, 235, 0.15)'
                            : 'rgba(148, 163, 184, 0.08)',
                        color: isActive ? '#62dce9' : isDone ? '#93c5fd' : '#64748b',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        background: isActive ? '#62dce9' : isDone ? '#2563eb' : 'rgba(148, 163, 184, 0.2)',
                        color: isActive || isDone ? '#0f172a' : '#94a3b8',
                      }}>
                        {isDone ? <Check size={10} /> : s.id}
                      </span>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5', fontSize: '13px' }} role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Form Step Body */}
            <form onSubmit={handleFinalSubmit} style={{ padding: '24px' }}>
              {/* STEP 1: VEHICLE INFORMATION */}
              {step === 1 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px' }}>1. Vehicle Identification</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Specify the vehicle manufacturer brand, model, and manufacturing year.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <label className="resale-field">
                      <span>Brand / Manufacturer *</span>
                      <input
                        autoComplete="off"
                        list="popular-brands"
                        maxLength="100"
                        onChange={(e) => updateField('brand', e.target.value)}
                        placeholder="e.g. Honda, Hyundai, Toyota"
                        required
                        value={values.brand}
                      />
                      <datalist id="popular-brands">
                        {POPULAR_BRANDS.map((b) => <option key={b} value={b} />)}
                      </datalist>
                    </label>

                    <label className="resale-field">
                      <span>Model Name *</span>
                      <input
                        autoComplete="off"
                        maxLength="120"
                        onChange={(e) => updateField('model', e.target.value)}
                        placeholder="e.g. City, Creta, Swift"
                        required
                        value={values.model}
                      />
                    </label>

                    <label className="resale-field">
                      <span>Manufacturing Year *</span>
                      <input
                        max={CURRENT_YEAR}
                        min="1886"
                        onChange={(e) => updateField('manufacturing_year', e.target.value)}
                        placeholder={`e.g. ${CURRENT_YEAR - 4}`}
                        required
                        type="number"
                        value={values.manufacturing_year}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: TECHNICAL SPECIFICATIONS */}
              {step === 2 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px' }}>2. Technical Specifications</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Select the powertrain configuration and record odometer distance.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <label className="resale-field">
                      <span>Fuel Type *</span>
                      <select
                        onChange={(e) => updateField('fuel_type', e.target.value)}
                        required
                        value={values.fuel_type}
                      >
                        {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </label>

                    <label className="resale-field">
                      <span>Transmission *</span>
                      <select
                        onChange={(e) => updateField('transmission', e.target.value)}
                        required
                        value={values.transmission}
                      >
                        {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>

                    <label className="resale-field">
                      <span>Kilometres Driven *</span>
                      <input
                        max="9000000000"
                        min="0"
                        onChange={(e) => updateField('kilometres_driven', e.target.value)}
                        placeholder="e.g. 45000"
                        required
                        type="number"
                        value={values.kilometres_driven}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 3: PRICE AND CURRENCY */}
              {step === 3 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px' }}>3. Price & Currency</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Enter your realistic asking price. Raw pricing is preserved without conversion.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <label className="resale-field">
                      <span>Asking Price *</span>
                      <input
                        min="0.01"
                        onChange={(e) => updateField('asking_price', e.target.value)}
                        placeholder="e.g. 650000"
                        required
                        step="0.01"
                        type="number"
                        value={values.asking_price}
                      />
                    </label>

                    <label className="resale-field">
                      <span>Currency Code (3 letters) *</span>
                      <input
                        maxLength="3"
                        minLength="3"
                        onChange={(e) => updateField('price_currency', e.target.value)}
                        pattern="[A-Za-z]{3}"
                        placeholder="INR"
                        required
                        title="Enter a 3-letter currency code, e.g. INR or USD."
                        value={values.price_currency}
                      />
                    </label>
                  </div>

                  <div style={{ background: 'rgba(98, 220, 233, 0.06)', border: '1px solid rgba(98, 220, 233, 0.2)', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '10px', fontSize: '12px', color: '#bfeef1' }}>
                    <Info size={18} style={{ flexShrink: 0 }} />
                    <span>Any purchase workflow is simulated for analytics. No real financial transaction or card charge will occur.</span>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION AND DESCRIPTION */}
              {step === 4 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px' }}>4. Location & Description</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Provide the vehicle location and a detailed condition overview.</p>
                  </div>

                  <label className="resale-field">
                    <span>City / Geographic Location *</span>
                    <input
                      autoComplete="address-level2"
                      maxLength="160"
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="e.g. Bangalore, Karnataka"
                      required
                      value={values.location}
                    />
                  </label>

                  <label className="resale-field full-width">
                    <span>Vehicle Description & Condition *</span>
                    <textarea
                      maxLength="5000"
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Describe the vehicle condition, service records, ownership history, tyre condition, and any recent servicing..."
                      required
                      rows={5}
                      value={values.description}
                    />
                    <small style={{ color: '#64748b', fontSize: '11px', textAlign: 'right', display: 'block' }}>
                      {values.description.length} / 5000 characters
                    </small>
                  </label>
                </div>
              )}

              {/* STEP 5: VEHICLE PHOTOS */}
              {step === 5 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px' }}>5. Vehicle Photographs</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                      Upload at least {MIN_PHOTOS} and up to {MAX_PHOTOS} genuine vehicle photographs. Supports JPEG, PNG, and WebP (up to 5 MB per image).
                    </p>
                  </div>

                  {/* Upload Drop Zone / Button */}
                  <div style={{
                    border: '2px dashed rgba(98, 220, 233, 0.3)',
                    borderRadius: '12px',
                    padding: '28px 20px',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.6)',
                  }}>
                    <ImagePlus size={36} style={{ color: '#62dce9', margin: '0 auto 10px' }} />
                    <h4 style={{ fontSize: '15px', color: '#f8fafc', margin: '0 0 4px' }}>
                      {photos.length ? `${photos.length} Photo${photos.length === 1 ? '' : 's'} Selected` : 'Select Vehicle Photos'}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 16px' }}>
                      JPEG, PNG, or WebP · Maximum 5 MB per photo · Minimum {MIN_PHOTOS} required
                    </p>

                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}>
                      <Upload size={16} />
                      {photos.length ? 'Add More Photos' : 'Choose Photos'}
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleAddPhotos}
                        style={{ display: 'none' }}
                        type="file"
                      />
                    </label>
                  </div>

                  {/* Previews Grid with Remove / Replace Controls */}
                  {photoPreviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginTop: '10px' }}>
                      {photoPreviews.map((item, index) => (
                        <div
                          key={item.url}
                          style={{
                            background: 'rgba(11, 19, 35, 0.9)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          }}
                        >
                          <div style={{ height: '120px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                            <img
                              alt={`Vehicle preview ${index + 1}`}
                              src={item.url}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {index === 0 && (
                              <span style={{
                                position: 'absolute',
                                top: 6,
                                left: 6,
                                background: '#2563eb',
                                color: '#ffffff',
                                fontSize: '9px',
                                fontWeight: '700',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}>
                                PRIMARY PHOTO
                              </span>
                            )}
                          </div>

                          <div style={{ padding: '10px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }} title={item.name}>
                              {item.name}
                            </span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                              {formatFileSize(item.size)}
                            </span>

                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                              <label style={{
                                flex: 1,
                                textAlign: 'center',
                                padding: '4px 6px',
                                background: 'rgba(148, 163, 184, 0.12)',
                                color: '#93c5fd',
                                fontSize: '10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}>
                                Replace
                                <input
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) => handleReplacePhoto(index, e)}
                                  style={{ display: 'none' }}
                                  type="file"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(index)}
                                title="Remove photo"
                                style={{
                                  padding: '4px 8px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#f87171',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isEditing && existingPhotos.length > 0 && photos.length === 0 && (
                    <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#93c5fd' }}>
                      {existingPhotos.length} existing photos will be kept. Choosing new photos will replace them upon submission.
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: OWNERSHIP DOCUMENTS */}
              {step === 6 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px' }}>6. Vehicle Ownership Documents</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                      Upload registration certificate (RC), insurance, or invoice for manual moderator review. Documents are strictly private.
                    </p>
                  </div>

                  <div style={{
                    border: '2px dashed rgba(148, 163, 184, 0.25)',
                    borderRadius: '12px',
                    padding: '28px 20px',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.6)',
                  }}>
                    <FileText size={36} style={{ color: '#93c5fd', margin: '0 auto 10px' }} />
                    <h4 style={{ fontSize: '15px', color: '#f8fafc', margin: '0 0 4px' }}>
                      {ownershipDocuments.length ? `${ownershipDocuments.length} Document${ownershipDocuments.length === 1 ? '' : 's'} Selected` : 'Select Ownership Documents'}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 16px' }}>
                      PDF, JPEG, PNG, or WebP · Up to {MAX_OWNERSHIP_DOCUMENTS} files · Max 5 MB each
                    </p>

                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(37, 99, 235, 0.8)',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}>
                      <Upload size={16} />
                      {ownershipDocuments.length ? 'Add More Documents' : 'Choose Documents'}
                      <input
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleAddDocuments}
                        style={{ display: 'none' }}
                        type="file"
                      />
                    </label>
                  </div>

                  {/* Document Chips List */}
                  {ownershipDocuments.length > 0 && (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {ownershipDocuments.map((doc, index) => (
                        <div
                          key={`${doc.name}-${index}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(11, 19, 35, 0.8)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <FileCheck size={18} style={{ color: '#62dce9', flexShrink: 0 }} />
                            <div>
                              <span style={{ fontSize: '12px', color: '#f8fafc', fontWeight: '500', display: 'block' }}>{doc.name}</span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>{formatFileSize(doc.size)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(index)}
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: '#f87171',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '10px', fontSize: '12px', color: '#94a3b8' }}>
                    <ShieldCheck size={20} style={{ color: '#62dce9', flexShrink: 0 }} />
                    <span>Privacy Notice: Ownership documents are strictly private between you and authorized moderators. They are never exposed publicly to other buyers.</span>
                  </div>
                </div>
              )}

              {/* STEP 7: REVIEW AND SUBMIT */}
              {step === 7 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 4px' }}>7. Review & Submit Listing</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Review all vehicle attributes and verified media attachments before submission.</p>
                  </div>

                  {/* Summary Card */}
                  <div style={{ background: 'rgba(11, 19, 35, 0.85)', border: '1px solid rgba(98, 220, 233, 0.25)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', paddingBottom: '14px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#62dce9', fontWeight: '700', textTransform: 'uppercase' }}>
                          {values.manufacturing_year} VEHICLE
                        </span>
                        <h3 style={{ fontSize: '22px', color: '#f8fafc', margin: '2px 0 0' }}>
                          {values.brand} {values.model}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Asking Price</span>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#62dce9' }}>
                          {values.price_currency} {Number(values.asking_price || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Fuel Type</span>
                        <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{values.fuel_type}</strong>
                      </div>
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Transmission</span>
                        <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{values.transmission}</strong>
                      </div>
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Distance Driven</span>
                        <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{Number(values.kilometres_driven || 0).toLocaleString()} km</strong>
                      </div>
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Location</span>
                        <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{values.location}</strong>
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Description</span>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {values.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                          {photos.length ? `${photos.length} new photos` : `${existingPhotos.length} existing photos`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                          {ownershipDocuments.length ? `${ownershipDocuments.length} new documents` : `${existingOwnershipDocuments} existing documents`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', color: '#93c5fd' }}>
                    <strong>Moderation Workflow:</strong> Upon submission, the listing status becomes <code>PENDING_APPROVAL</code>. A moderator will review your photos and ownership documents before making the listing active in the marketplace.
                  </div>
                </div>
              )}

              {/* Navigation Actions (Back / Next / Submit) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(148, 163, 184, 0.15)',
                paddingTop: '20px',
                marginTop: '24px',
              }}>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(148, 163, 184, 0.12)',
                      color: '#cbd5e1',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : (
                  <Link
                    to="/my-listings"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#64748b',
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    Cancel
                  </Link>
                )}

                {step < STEPS.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 22px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    }}
                  >
                    Next Step <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 26px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: saving ? 'wait' : 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? 'Submitting Listing…' : isEditing ? 'Resubmit For Verification' : 'Confirm & Submit Listing'}
                    <Check size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}

export default CustomerListingFormPage
