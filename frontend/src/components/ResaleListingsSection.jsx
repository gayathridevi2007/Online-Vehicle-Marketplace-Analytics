import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CarFront, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import '../styles/resale-marketplace.css'

const EMPTY_FILTERS = {
  q: '',
  brand: '',
  model: '',
  year: '',
  fuel_type: '',
  transmission: '',
  location: '',
  price_currency: '',
  min_price: '',
  max_price: '',
}

function formattedPrice(listing) {
  const amount = Number(listing.asking_price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${listing.price_currency} ${amount}`
}

function ListingPhoto({ listingId, photoId, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (!photoId || failed) {
    return (
      <div className={`resale-photo-placeholder ${className}`} role="img" aria-label={`${alt} photo unavailable`}>
        <CarFront aria-hidden="true" size={30} />
        <span>Photo unavailable</span>
      </div>
    )
  }
  return (
    <img
      alt={alt}
      className={className}
      crossOrigin="use-credentials"
      onError={() => setFailed(true)}
      src={api.marketplacePhotoUrl(listingId, photoId)}
    />
  )
}

function ListingDetailsDialog({ listing, onClose }) {
  const [state, setState] = useState({ status: 'loading' })
  const [photoIndex, setPhotoIndex] = useState(0)
  const [purchaseState, setPurchaseState] = useState({ status: 'idle' })

  useEffect(() => {
    let active = true
    api.marketplaceListing(listing.id)
      .then(({ listing: details }) => {
        if (active) setState({ status: 'success', listing: details })
      })
      .catch((error) => {
        if (active) setState({
          status: 'error',
          message: error.message || 'Listing details could not be loaded.',
        })
      })
    return () => { active = false }
  }, [listing.id])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  const details = state.status === 'success' ? state.listing : listing
  const photos = details.photo_ids || []

  async function simulatePurchase() {
    setPurchaseState({ status: 'loading' })
    try {
      const result = await api.marketplacePurchase(details.id)
      setPurchaseState({ status: 'success', result })
    } catch (error) {
      setPurchaseState({
        status: 'error',
        message: error.message || 'The purchase simulation could not be completed.',
      })
    }
  }

  return (
    <div
      className="resale-dialog-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="resale-dialog-title"
        aria-modal="true"
        className="resale-dialog"
        role="dialog"
      >
        <header className="resale-dialog-header">
          <div>
            <span className="customer-section-index">APPROVED SELLER LISTING</span>
            <h2 id="resale-dialog-title">{details.brand} {details.model}</h2>
          </div>
          <button aria-label="Close listing details" className="resale-icon-button" onClick={onClose} type="button">
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        {state.status === 'loading' && <p className="resale-state" role="status">Loading listing details…</p>}
        {state.status === 'error' && <p className="resale-state is-error" role="alert">{state.message}</p>}
        {state.status === 'success' && (
          <div className="resale-dialog-content">
            <div className="resale-dialog-gallery">
              <ListingPhoto
                alt={`${details.brand} ${details.model}`}
                className="resale-dialog-photo"
                listingId={details.id}
                photoId={photos[photoIndex]}
              />
              {photos.length > 1 && (
                <div className="resale-gallery-controls">
                  <button
                    aria-label="Previous vehicle photo"
                    className="resale-icon-button"
                    onClick={() => setPhotoIndex((index) => (index + photos.length - 1) % photos.length)}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" size={17} />
                  </button>
                  <span>{photoIndex + 1} / {photos.length}</span>
                  <button
                    aria-label="Next vehicle photo"
                    className="resale-icon-button"
                    onClick={() => setPhotoIndex((index) => (index + 1) % photos.length)}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" size={17} />
                  </button>
                </div>
              )}
            </div>

            <div className="resale-dialog-facts">
              <p className="resale-detail-price">{formattedPrice(details)}</p>
              <dl>
                <div><dt>Manufacturing year</dt><dd>{details.manufacturing_year}</dd></div>
                <div><dt>Fuel</dt><dd>{details.fuel_type}</dd></div>
                <div><dt>Transmission</dt><dd>{details.transmission}</dd></div>
                <div><dt>Kilometres driven</dt><dd>{Number(details.kilometres_driven).toLocaleString()}</dd></div>
                <div><dt>Location</dt><dd>{details.location}</dd></div>
              </dl>
              <p className="resale-detail-description">{details.description}</p>
              {details.seller && (
                <div className="resale-contact-card">
                  <span className="customer-section-index">CONTACT SELLER</span>
                  <strong>{details.seller.name}</strong>
                  <div className="resale-contact-actions">
                    <a href={`tel:${details.seller.phone}`}>Call seller</a>
                    <a href={`mailto:${details.seller.email}`}>Email seller</a>
                  </div>
                </div>
              )}
              <div className="resale-purchase-card">
                <strong>SIMULATED PURCHASE PAYMENT</strong>
                <p>No money is charged or transferred. This records a simulation and notifies the Admin Portal.</p>
                {purchaseState.status === 'success'
                  ? (
                    <p className="resale-form-success" role="status">
                      Simulation recorded; this is not a confirmed sale · Transaction {purchaseState.result.transaction.transaction_id}
                    </p>
                  )
                  : (
                    <button
                      className="resale-primary-link"
                      disabled={purchaseState.status === 'loading'}
                      onClick={simulatePurchase}
                      type="button"
                    >
                      {purchaseState.status === 'loading' ? 'Recording simulation…' : 'Simulate purchase payment'}
                    </button>
                  )}
                {purchaseState.status === 'error' && (
                  <p className="resale-form-error" role="alert">{purchaseState.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function ResaleListingsSection({ account, authStatus }) {
  const accountId = account?.id
  const [criteria, setCriteria] = useState(EMPTY_FILTERS)
  const [applied, setApplied] = useState({})
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [state, setState] = useState({ status: 'idle' })
  const [selectedListing, setSelectedListing] = useState(null)

  useEffect(() => {
    if (authStatus !== 'ready' || !accountId) return undefined
    let active = true
    api.marketplaceActivateBuyer()
      .then(() => api.marketplaceListings({
        ...applied,
        page,
        per_page: 12,
      }))
      .then((data) => {
        if (active) setState({ status: 'success', accountId, data })
      })
      .catch((error) => {
        if (active) setState({
          status: 'error',
          accountId,
          message: error.message || 'Approved resale listings are unavailable.',
        })
      })
    return () => { active = false }
  }, [accountId, applied, authStatus, page, refreshKey])

  function updateCriteria(event) {
    const { name, value } = event.target
    setCriteria((current) => ({
      ...current,
      [name]: value,
      ...(name === 'price_currency' && value !== current.price_currency
        ? { min_price: '', max_price: '' }
        : {}),
    }))
  }

  function applyFilters(event) {
    event.preventDefault()
    const next = Object.fromEntries(
      Object.entries(criteria).filter(([, value]) => value !== ''),
    )
    setState({ status: 'loading' })
    setApplied(next)
    setPage(1)
  }

  function clearFilters() {
    setCriteria(EMPTY_FILTERS)
    setState({ status: 'loading' })
    setApplied({})
    setPage(1)
  }

  function changePage(nextPage) {
    setState({ status: 'loading' })
    setPage(nextPage)
  }

  function retryListings() {
    setState({ status: 'loading' })
    setRefreshKey((key) => key + 1)
  }

  const visibleState = accountId && state.accountId !== accountId
    ? { status: 'loading' }
    : state
  const data = visibleState.status === 'success' ? visibleState.data : null
  const listings = data?.listings || []
  const pages = data?.pagination?.total_pages || 0

  return (
    <>
      <section
        aria-labelledby="resale-marketplace-title"
        className="customer-section resale-marketplace-section"
        id="resale-marketplace"
      >
        <div className="customer-section-heading resale-section-heading">
          <div>
            <span className="customer-section-index">02 / CUSTOMER RESALE MARKETPLACE</span>
            <h2 id="resale-marketplace-title">Cars listed by customers</h2>
            <p>Only moderator-approved active listings appear here. These are seller-submitted listings, separate from the accepted-data catalogue.</p>
          </div>
          <Link className="resale-primary-link" to="/sell-car">
            Sell Your Car <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        {authStatus === 'loading' && <p className="resale-state" role="status">Checking marketplace access…</p>}
        {authStatus === 'error' && (
          <p className="resale-state is-error" role="alert">Customer account service is unavailable. Try again after checking the backend.</p>
        )}
        {authStatus === 'ready' && !account && (
          <div className="resale-locked-card">
            <div>
              <span className="customer-section-index">SIGN IN TO BUY</span>
              <h3>Browse approved customer listings</h3>
              <p>Sign in to search active listings, view seller details, and contact a seller.</p>
            </div>
            <Link className="resale-primary-link" to="/login">
              Sign in <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        )}

        {account && (
          <form className="resale-filters" onSubmit={applyFilters}>
            <label>
              <span>Search cars</span>
              <span className="resale-search-input">
                <Search aria-hidden="true" size={15} />
                <input name="q" onChange={updateCriteria} placeholder="Brand, model, location…" value={criteria.q} />
              </span>
            </label>
            <label>
              <span>Brand</span>
              <select name="brand" onChange={updateCriteria} value={criteria.brand}>
                <option value="">All brands</option>
                {(data?.filters.brands || []).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Model</span>
              <input name="model" onChange={updateCriteria} placeholder="Model" value={criteria.model} />
            </label>
            <label>
              <span>Year</span>
              <select name="year" onChange={updateCriteria} value={criteria.year}>
                <option value="">Any year</option>
                {(data?.filters.years || []).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Fuel</span>
              <select name="fuel_type" onChange={updateCriteria} value={criteria.fuel_type}>
                <option value="">Any fuel</option>
                {(data?.filters.fuel_types || []).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Transmission</span>
              <select name="transmission" onChange={updateCriteria} value={criteria.transmission}>
                <option value="">Any transmission</option>
                {(data?.filters.transmissions || []).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Location</span>
              <select name="location" onChange={updateCriteria} value={criteria.location}>
                <option value="">Any location</option>
                {(data?.filters.locations || []).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Currency</span>
              <select name="price_currency" onChange={updateCriteria} value={criteria.price_currency}>
                <option value="">Any currency</option>
                {(data?.filters.currencies || []).map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Minimum price</span>
              <input
                disabled={!criteria.price_currency}
                min="0"
                name="min_price"
                onChange={updateCriteria}
                placeholder={criteria.price_currency ? '0' : 'Select currency'}
                step="0.01"
                type="number"
                value={criteria.min_price}
              />
            </label>
            <label>
              <span>Maximum price</span>
              <input
                disabled={!criteria.price_currency}
                min="0"
                name="max_price"
                onChange={updateCriteria}
                placeholder={criteria.price_currency ? 'No limit' : 'Select currency'}
                step="0.01"
                type="number"
                value={criteria.max_price}
              />
            </label>
            <div className="resale-filter-actions">
              <button className="resale-primary-link" type="submit">Apply filters</button>
              <button className="resale-quiet-button" onClick={clearFilters} type="button">Clear</button>
            </div>
          </form>
        )}

        {account && visibleState.status === 'loading' && <p className="resale-state" role="status">Loading approved listings…</p>}
        {account && visibleState.status === 'error' && (
          <div className="resale-state is-error" role="alert">
            <p>{visibleState.message}</p>
            <button className="resale-quiet-button" onClick={retryListings} type="button">
              Retry
            </button>
          </div>
        )}
        {account && visibleState.status === 'success' && listings.length === 0 && (
          <div className="resale-empty-state">
            <CarFront aria-hidden="true" size={27} />
            <strong>No approved listings match these filters.</strong>
            <p>New submissions appear after marketplace moderator verification.</p>
          </div>
        )}
        {account && visibleState.status === 'success' && listings.length > 0 && (
          <>
            <div className="resale-card-grid">
              {listings.map((listing) => (
                <article className="resale-listing-card" key={listing.id}>
                  <div className="resale-listing-image">
                    <ListingPhoto
                      alt={`${listing.brand} ${listing.model}`}
                      listingId={listing.id}
                      photoId={listing.photo_ids[0]}
                    />
                    {listing.photo_ids.length > 1 && (
                      <span className="resale-photo-count">{listing.photo_ids.length} photos</span>
                    )}
                  </div>
                  <div className="resale-listing-card-body">
                    <div className="resale-listing-title">
                      <span>{listing.brand}</span>
                      <h3>{listing.model}</h3>
                    </div>
                    <strong className="resale-listing-price">{formattedPrice(listing)}</strong>
                    <div className="resale-listing-meta">
                      <span>{listing.manufacturing_year}</span>
                      <span>{listing.fuel_type}</span>
                      <span>{listing.transmission}</span>
                      <span>{Number(listing.kilometres_driven).toLocaleString()} km</span>
                    </div>
                    <p className="resale-listing-location">{listing.location}</p>
                    <button className="resale-detail-button" onClick={() => setSelectedListing(listing)} type="button">
                      View Details <ArrowRight aria-hidden="true" size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {pages > 1 && (
              <div aria-label="Marketplace pagination" className="resale-pagination">
                <button disabled={page <= 1} onClick={() => changePage(page - 1)} type="button">
                  <ArrowLeft aria-hidden="true" size={14} /> Previous
                </button>
                <span>Page {page} of {pages}</span>
                <button disabled={page >= pages} onClick={() => changePage(page + 1)} type="button">
                  Next <ArrowRight aria-hidden="true" size={14} />
                </button>
              </div>
            )}
          </>
        )}

        <div className="resale-seller-cta">
          <span>Have a car to sell?</span>
          <Link to="/sell-car">Create a seller listing <ArrowRight aria-hidden="true" size={14} /></Link>
          {account && <Link to="/my-listings">Manage your listings <ArrowRight aria-hidden="true" size={14} /></Link>}
        </div>
      </section>

      {selectedListing && (
        <ListingDetailsDialog
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </>
  )
}

export default ResaleListingsSection
