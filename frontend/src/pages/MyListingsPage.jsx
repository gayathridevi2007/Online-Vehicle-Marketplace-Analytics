
import { useEffect, useState } from 'react'
import { ArrowRight, CarFront, Pencil, Plus, Trash2, Bell, CalendarDays } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import CustomerHeader from '../components/CustomerHeader.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'

import '../styles/seller-marketplace.css'

const STATUS_LABELS = {
  PENDING_APPROVAL: 'Pending approval',
  APPROVED_ACTIVE: 'Approved · active',
  REJECTED: 'Needs changes',
  WITHDRAWN: 'Withdrawn',
  SIMULATED_PURCHASE: 'Purchase simulated · not sold',
}

function MyListingsPage() {
  const { account, status: authStatus } = useCustomerAuth()
  const accountId = account?.id
  const location = useLocation()

  const [state, setState] = useState({ status: 'idle' })
  const [bookingState, setBookingState] = useState({ status: 'idle', bookings: [] })
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmingId, setConfirmingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authStatus !== 'ready' || !accountId) return undefined

    let active = true

    api.marketplaceMyListings()
      .then((data) => {
        if (active) setState({ status: 'success', accountId, data })
      })
      .catch((requestError) => {
        if (active) setState({
          status: 'error',
          accountId,
          message: requestError.message || 'Your listings could not be loaded.',
        })
      })

    return () => { active = false }
  }, [accountId, authStatus, refreshKey])

  // Load bookings belonging only to the signed-in seller.
  useEffect(() => {
    if (authStatus !== 'ready' || !accountId) return undefined

    let active = true
    setBookingState({ status: 'loading', bookings: [] })

    api.marketplaceSellerBookings()
      .then((data) => {
        if (active) {
          setBookingState({
            status: 'success',
            bookings: data.bookings || [],
          })
        }
      })
      .catch((requestError) => {
        if (active) {
          setBookingState({
            status: 'error',
            bookings: [],
            message: requestError.message || 'Bookings could not be loaded.',
          })
        }
      })

    return () => { active = false }
  }, [accountId, authStatus, refreshKey])

  async function withdrawListing(listingId) {
    setError('')
    try {
      await api.marketplaceWithdrawListing(listingId)
      setState({ status: 'loading' })
      setConfirmingId(null)
      setRefreshKey((key) => key + 1)
    } catch (requestError) {
      setError(requestError.message || 'The listing could not be withdrawn.')
    }
  }

  function retryListings() {
    setState({ status: 'loading' })
    setRefreshKey((key) => key + 1)
  }

  const visibleState = accountId && state.accountId !== accountId
    ? { status: 'loading' }
    : state

  const listings = visibleState.status === 'success'
    ? visibleState.data.listings
    : []

  const bookings = bookingState.bookings || []

  return (
    <main className="customer-marketplace">
      <CustomerHeader />

      <div className="resale-page-shell">
        <div className="resale-page-heading">
          <span className="customer-eyebrow">
            <span className="customer-eyebrow-dot" /> SELLER WORKSPACE
          </span>
          <h1>My listings.</h1>
          <p>
            Track verification, update your listing, or withdraw it.
            Changes to an active listing return it to verification.
          </p>
        </div>

        {location.state?.notice && (
          <p className="resale-form-success" role="status">
            {location.state.notice}
          </p>
        )}

        {authStatus === 'loading' && (
          <p className="resale-state" role="status">Checking your account…</p>
        )}

        {authStatus === 'error' && (
          <p className="resale-state is-error" role="alert">
            Customer account service is unavailable. Try again after checking the backend.
          </p>
        )}

        {authStatus === 'ready' && !account && (
          <div className="resale-locked-card">
            <div>
              <span className="customer-section-index">CUSTOMER ACCOUNT REQUIRED</span>
              <h3>Sign in to manage listings</h3>
              <p>Your seller submissions are available from the account used to create them.</p>
            </div>
            <Link className="resale-primary-link" to="/login">
              Sign in <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
        )}

        {account && visibleState.status === 'loading' && (
          <p className="resale-state" role="status">Loading your listings…</p>
        )}

        {account && visibleState.status === 'error' && (
          <div className="resale-state is-error" role="alert">
            <p>{visibleState.message}</p>
            <button className="resale-quiet-button" onClick={retryListings} type="button">
              Retry
            </button>
          </div>
        )}

        {account && visibleState.status === 'success' && (
          <>
            {/* SELLER BOOKING NOTIFICATIONS */}
            <section style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
              }}>
                <div>
                  <span className="customer-section-index">BUYER ACTIVITY</span>
                  <h2 style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <Bell size={21} aria-hidden="true" />
                    Bookings &amp; Enquiries
                  </h2>
                  <p className="resale-form-help">
                    See buyers who have reserved your vehicles.
                  </p>
                </div>

                {bookingState.status === 'success' && (
                  <span className="resale-status is-active">
                    {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                  </span>
                )}
              </div>

              {bookingState.status === 'loading' && (
                <p className="resale-state" role="status">Checking your bookings…</p>
              )}

              {bookingState.status === 'error' && (
                <div className="resale-state is-error" role="alert">
                  <p>{bookingState.message}</p>
                  <button
                    className="resale-quiet-button"
                    type="button"
                    onClick={() => setRefreshKey((key) => key + 1)}
                  >
                    Retry bookings
                  </button>
                </div>
              )}

              {bookingState.status === 'success' && bookings.length === 0 && (
                <div className="resale-empty-state">
                  <Bell size={25} aria-hidden="true" />
                  <strong>No bookings yet.</strong>
                  <p>
                    When a buyer reserves one of your approved vehicles,
                    the booking details will appear here.
                  </p>
                </div>
              )}

              {bookingState.status === 'success' && bookings.length > 0 && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {bookings.map((booking) => (
                    <article
                      key={booking.id}
                      className="resale-my-listing"
                      style={{ padding: '20px', alignItems: 'flex-start' }}
                    >
                      {booking.photo_ids?.[0] && booking.listing_id ? (
                        <img
                          alt={booking.vehicle || 'Booked vehicle'}
                          crossOrigin="use-credentials"
                          src={api.marketplacePhotoUrl(
                            booking.listing_id,
                            booking.photo_ids[0]
                          )}
                        />
                      ) : (
                        <div className="resale-photo-placeholder">
                          <CarFront size={27} aria-hidden="true" />
                        </div>
                      )}

                      <div className="resale-my-listing-content">
                        <span className="resale-status is-active">
                          {booking.payment_status === 'CONFIRMED_DEMO'
                            ? 'Demo deposit confirmed'
                            : booking.payment_status || 'Booking received'}
                        </span>

                        <h2>{booking.vehicle || 'Vehicle booking'}</h2>

                        <p>
                          <strong>Booking reference:</strong>{' '}
                          {booking.booking_reference}
                        </p>

                        <p>
                          <strong>Buyer:</strong> {booking.buyer_name}
                        </p>

                        <p>
                          <strong>Email:</strong> {booking.buyer_email || 'Not provided'}
                        </p>

                        <p>
                          <strong>Phone:</strong> {booking.buyer_phone || 'Not provided'}
                        </p>

                        <div style={{
                          marginTop: '12px',
                          padding: '14px',
                          borderRadius: '10px',
                          background: 'rgba(0, 0, 0, 0.035)',
                        }}>
                          <p>
                            <strong>Vehicle price:</strong>{' '}
                            {booking.currency} {Number(booking.total_price).toLocaleString()}
                          </p>
                          <p>
                            <strong>50% demo deposit:</strong>{' '}
                            {booking.currency} {Number(booking.deposit_amount).toLocaleString()}
                          </p>
                          <p>
                            <strong>Remaining balance:</strong>{' '}
                            {booking.currency} {Number(booking.remaining_balance).toLocaleString()}
                          </p>
                        </div>

                        <p className="resale-form-help" style={{ marginTop: '12px' }}>
                          <CalendarDays
                            size={14}
                            aria-hidden="true"
                            style={{ verticalAlign: 'middle', marginRight: '5px' }}
                          />
                          {booking.created_at
                            ? new Date(booking.created_at).toLocaleString()
                            : 'Date unavailable'}
                        </p>

                        <p className="resale-form-help">
                          {booking.notice || 'DEMO PAYMENT — NO REAL MONEY TRANSFERRED'}
                        </p>

                        <p className="resale-form-help">
                          Demo payment reference: {booking.demo_payment_reference || 'Not available'}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="resale-seller-cta">
              <span>
                Customer roles: {visibleState.data.roles.length
                  ? visibleState.data.roles.join(' · ')
                  : 'Not activated yet'}
              </span>
              <Link className="resale-primary-link" to="/sell-car">
                <Plus aria-hidden="true" size={15} /> Sell Your Car
              </Link>
            </div>

            {error && (
              <p className="resale-form-error" role="alert">{error}</p>
            )}

            {listings.length === 0 ? (
              <div className="resale-empty-state">
                <CarFront aria-hidden="true" size={27} />
                <strong>You have not submitted a vehicle listing yet.</strong>
                <p>Your account can browse as a buyer and submit listings as a seller.</p>
                <Link className="resale-primary-link" to="/sell-car">
                  Create your first listing <ArrowRight aria-hidden="true" size={14} />
                </Link>
              </div>
            ) : (
              <div className="resale-my-listings">
                {listings.map((listing) => {
                  const statusClass = listing.status === 'APPROVED_ACTIVE'
                    ? 'is-active'
                    : listing.status === 'SIMULATED_PURCHASE'
                      ? 'is-simulated'
                      : listing.status === 'REJECTED'
                        ? 'is-rejected'
                        : listing.status === 'WITHDRAWN'
                          ? 'is-withdrawn'
                          : 'is-pending'

                  return (
                    <article className="resale-my-listing" key={listing.id}>
                      {listing.photo_ids[0] ? (
                        <img
                          alt={`${listing.brand} ${listing.model}`}
                          crossOrigin="use-credentials"
                          src={api.marketplacePhotoUrl(listing.id, listing.photo_ids[0])}
                        />
                      ) : (
                        <div className="resale-photo-placeholder">
                          <CarFront aria-hidden="true" size={26} />
                        </div>
                      )}

                      <div className="resale-my-listing-content">
                        <span className={`resale-status ${statusClass}`}>
                          {STATUS_LABELS[listing.status] || listing.status}
                        </span>

                        <h2>
                          {listing.manufacturing_year} {listing.brand} {listing.model}
                        </h2>

                        <p>
                          {listing.price_currency}{' '}
                          {Number(listing.asking_price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} · {listing.location}
                        </p>

                        <p className="resale-form-help">
                          {listing.status === 'PENDING_APPROVAL'
                            ? 'This submission is hidden from buyers until seller verification and approval are complete.'
                            : listing.status === 'APPROVED_ACTIVE'
                              ? 'This listing is visible to signed-in buyers.'
                              : listing.status === 'SIMULATED_PURCHASE'
                                ? 'A purchase was simulated; the vehicle is not confirmed sold, and no money was transferred.'
                                : listing.status === 'REJECTED'
                                  ? 'Review the moderator note, edit, and resubmit for verification.'
                                  : 'This listing is no longer visible to buyers.'}
                        </p>

                        {listing.moderation_note && (
                          <p className="resale-form-error">
                            Moderator note: {listing.moderation_note}
                          </p>
                        )}

                        <div className="resale-management-actions">
                          <Link className="resale-quiet-button" to={`/sell-car/${listing.id}`}>
                            <Pencil aria-hidden="true" size={14} /> Edit
                          </Link>

                          {confirmingId === listing.id ? (
                            <>
                              <span className="resale-form-help">Withdraw this listing?</span>
                              <button
                                className="resale-danger-button"
                                onClick={() => withdrawListing(listing.id)}
                                type="button"
                              >
                                Confirm withdraw
                              </button>
                              <button
                                className="resale-quiet-button"
                                onClick={() => setConfirmingId(null)}
                                type="button"
                              >
                                Keep listing
                              </button>
                            </>
                          ) : (
                            <button
                              className="resale-danger-button"
                              disabled={listing.status === 'WITHDRAWN'}
                              onClick={() => setConfirmingId(listing.id)}
                              type="button"
                            >
                              <Trash2 aria-hidden="true" size={14} /> Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default MyListingsPage
