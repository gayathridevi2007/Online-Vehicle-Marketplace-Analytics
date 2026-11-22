import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { WhiteMarketplaceHeader } from '../components/WhiteMarketplaceHeader.jsx'
import { WhiteVehicleCard } from '../components/WhiteVehicleCard.jsx'
import { WhiteVehicleDetailModal } from '../components/WhiteVehicleDetailModal.jsx'
import { QrDemoPaymentModal } from '../components/QrDemoPaymentModal.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/white-marketplace.css'

export default function BuyerMarketplacePage() {
  const navigate = useNavigate()
  const { account } = useCustomerAuth()

  // Listings State
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalListings, setTotalListings] = useState(0)

  // Dynamic Filter Options
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    models: [],
    years: [],
    fuel_types: [],
    transmissions: [],
    locations: [],
  })

  // Selected Filters
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    fuel_type: '',
    transmission: '',
    location: '',
    min_price: '',
    max_price: '',
    q: '',
  })

  // Modals & User selections
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [bookingVehicle, setBookingVehicle] = useState(null)
  const [favourites, setFavourites] = useState(new Set())
  const [comparing, setComparing] = useState(new Set())

  // Load filter options from database
  useEffect(() => {
    api.vehicleFilterOptions()
      .then((data) => {
        setFilterOptions((prev) => ({
          ...prev,
          brands: data.brands || [],
          years: data.years || [],
          fuel_types: data.fuel_types || ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
          transmissions: data.transmissions || ['Manual', 'Automatic'],
          locations: (data.locations || []).map((loc) => typeof loc === 'object' ? loc.city || loc.state : loc),
        }))
      })
      .catch(() => {})
  }, [])

  // Load models dynamically when brand changes
  useEffect(() => {
    if (filters.brand) {
      api.vehicleFilterOptions(filters.brand)
        .then((data) => {
          setFilterOptions((prev) => ({
            ...prev,
            models: data.models || [],
          }))
        })
        .catch(() => {})
    } else {
      setFilterOptions((prev) => ({ ...prev, models: [] }))
    }
  }, [filters.brand])

  // Fetch listings with pagination (10 per page initially)
  const fetchListings = useCallback(() => {
    setLoading(true)
    setError('')

    const queryParams = {
      page,
      per_page: 10,
      price_currency: 'INR',
    }
    if (filters.brand) queryParams.brand = filters.brand
    if (filters.model) queryParams.model = filters.model
    if (filters.year) queryParams.year = filters.year
    if (filters.fuel_type) queryParams.fuel_type = filters.fuel_type
    if (filters.transmission) queryParams.transmission = filters.transmission
    if (filters.location) queryParams.location = filters.location
    if (filters.min_price) queryParams.min_price = filters.min_price
    if (filters.max_price) queryParams.max_price = filters.max_price
    if (filters.q) queryParams.q = filters.q

    api.marketplaceListings(queryParams)
      .then((data) => {
        setListings(data.listings || [])
        setTotalPages(data.pagination?.total_pages || 1)
        setTotalListings(data.pagination?.total_listings || 0)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Marketplace listings could not be loaded.')
        setLoading(false)
      })
  }, [filters, page])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Load favourites
  useEffect(() => {
    if (!account) return
    api.marketplaceFavourites()
      .then((data) => {
        if (data.favourite_ids) setFavourites(new Set(data.favourite_ids))
      })
      .catch(() => {})
  }, [account])

  function handleFilterChange(key, value) {
    setPage(1)
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'brand' ? { model: '' } : {}),
    }))
  }

  function handleResetFilters() {
    setPage(1)
    setFilters({
      brand: '',
      model: '',
      year: '',
      fuel_type: '',
      transmission: '',
      location: '',
      min_price: '',
      max_price: '',
      q: '',
    })
  }

  function toggleFavourite(vehicle) {
    if (!account) {
      navigate('/buyer/login')
      return
    }
    const isFav = favourites.has(vehicle.id)
    if (isFav) {
      api.marketplaceRemoveFavourite(vehicle.id)
        .then(() => setFavourites((prev) => {
          const next = new Set(prev)
          next.delete(vehicle.id)
          return next
        }))
        .catch(() => {})
    } else {
      api.marketplaceAddFavourite(vehicle.id)
        .then(() => setFavourites((prev) => new Set([...prev, vehicle.id])))
        .catch(() => {})
    }
  }

  function toggleCompare(vehicle) {
    setComparing((prev) => {
      const next = new Set(prev)
      if (next.has(vehicle.id)) {
        next.delete(vehicle.id)
      } else {
        if (next.size >= 4) {
          alert('You can compare up to 4 vehicles side by side.')
          return prev
        }
        next.add(vehicle.id)
      }
      return next
    })
  }

  function startBooking(vehicle) {
    if (!account) {
      navigate('/buyer/login')
      return
    }
    setBookingVehicle(vehicle)
  }

  async function handleConfirmBooking() {
    if (!bookingVehicle) return
    const res = await api.marketplaceCreateBooking(bookingVehicle.id, 'Demo booking from buyer marketplace.')
    setListings((current) => current.filter((item) => item.id !== bookingVehicle.id))
    return res
  }

  const activeFiltersCount = Object.values(filters).filter((v) => v !== '').length

  return (
    <div className="white-marketplace-theme">
      <WhiteMarketplaceHeader />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px', width: '100%' }}>
        {/* Breadcrumb & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
              <ShieldCheck size={14} /> Buyer Marketplace Portal
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
              Discover Verified Vehicles
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {comparing.size > 0 && (
              <Link to="/buyer/compare" className="w-btn w-btn-secondary w-btn-sm">
                <Layers size={14} /> Compare ({comparing.size}) Selected
              </Link>
            )}
            <Link to="/buyer/membership" className="w-btn w-btn-outline w-btn-sm">
              <Sparkles size={14} color="#eab308" /> Upgrade Membership
            </Link>
          </div>
        </div>

        {/* Dynamic Database Filters Bar */}
        <div className="w-filter-bar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={15} color="#2563eb" /> Filter Vehicles from Database
              {activeFiltersCount > 0 && (
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                  {activeFiltersCount} active
                </span>
              )}
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                className="w-btn w-btn-outline w-btn-sm"
                onClick={handleResetFilters}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <RotateCcw size={12} /> Clear all filters
              </button>
            )}
          </div>

          <div className="w-filter-row">
            {/* Search */}
            <div className="w-filter-group" style={{ flex: '1.5', minWidth: '180px' }}>
              <label className="w-filter-label">Search Query</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="w-filter-input"
                  style={{ width: '100%', paddingLeft: '32px' }}
                  placeholder="Model, keyword or trim…"
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              </div>
            </div>

            {/* Brand */}
            <div className="w-filter-group">
              <label className="w-filter-label">Brand</label>
              <select
                className="w-filter-select"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="w-filter-group">
              <label className="w-filter-label">Model</label>
              <select
                className="w-filter-select"
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                disabled={!filters.brand}
              >
                <option value="">{filters.brand ? 'All Models' : 'Select Brand First'}</option>
                {filterOptions.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="w-filter-group">
              <label className="w-filter-label">Year</label>
              <select
                className="w-filter-select"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="">All Years</option>
                {filterOptions.years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Fuel Type */}
            <div className="w-filter-group">
              <label className="w-filter-label">Fuel</label>
              <select
                className="w-filter-select"
                value={filters.fuel_type}
                onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
              >
                <option value="">All Fuels</option>
                {filterOptions.fuel_types.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div className="w-filter-group">
              <label className="w-filter-label">Transmission</label>
              <select
                className="w-filter-select"
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
              >
                <option value="">All Transmissions</option>
                {filterOptions.transmissions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="w-filter-group">
              <label className="w-filter-label">Location</label>
              <input
                type="text"
                className="w-filter-input"
                placeholder="City or State"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="w-filter-group" style={{ minWidth: '180px' }}>
              <label className="w-filter-label">Max Price (₹)</label>
              <input
                type="number"
                className="w-filter-input"
                placeholder="e.g. 1500000"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Listings Display: 10 per page with pagination */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <CarFront size={38} className="animate-pulse" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '15px', fontWeight: '600' }}>Filtering verified vehicle listings…</p>
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#dc2626' }}>
            <p style={{ fontWeight: '700', margin: '0 0 8px 0' }}>{error}</p>
            <button type="button" className="w-btn w-btn-outline w-btn-sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <CarFront size={44} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>No vehicles match your filters</h3>
            <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>Try broadening your search criteria or resetting filters.</p>
            <button type="button" className="w-btn w-btn-primary" onClick={handleResetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
                Showing <strong>{listings.length}</strong> of <strong>{totalListings}</strong> verified vehicles (Page {page} of {totalPages})
              </span>
            </div>

            <div className="w-vehicle-grid">
              {listings.map((vehicle) => (
                <WhiteVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isFavourite={favourites.has(vehicle.id)}
                  onToggleFavourite={toggleFavourite}
                  isComparing={comparing.has(vehicle.id)}
                  onToggleCompare={toggleCompare}
                  onInspect={(v) => setSelectedVehicle(v)}
                  onBook={(v) => startBooking(v)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="w-pagination">
                <button
                  type="button"
                  className="w-pagination-btn"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: '-3px' }} /> Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    className={`w-pagination-btn ${page === i + 1 ? 'is-active' : ''}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className="w-pagination-btn"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Next <ChevronRight size={16} style={{ display: 'inline', verticalAlign: '-3px' }} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Vehicle Detail Dialog */}
      <WhiteVehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        onBook={(v) => startBooking(v)}
      />

      {/* QR Demo Payment Booking Modal (50% Deposit) */}
      <QrDemoPaymentModal
        isOpen={Boolean(bookingVehicle)}
        onClose={() => setBookingVehicle(null)}
        title={`Book ${bookingVehicle?.manufacturing_year || ''} ${bookingVehicle?.brand || ''} ${bookingVehicle?.model || ''}`}
        subtitle="50% Deposit Vehicle Reservation"
        amount={(Number(bookingVehicle?.asking_price || 0) * 0.5).toFixed(2)}
        totalAmount={bookingVehicle?.asking_price}
        remainingBalance={(Number(bookingVehicle?.asking_price || 0) * 0.5).toFixed(2)}
        referenceId={`BK-VMA-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
        isDeposit={true}
        onConfirm={handleConfirmBooking}
        confirmButtonText="Confirm 50% Demo Deposit"
      />
    </div>
  )
}
