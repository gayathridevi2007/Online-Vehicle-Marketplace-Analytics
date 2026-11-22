
import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  LogOut,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAdminPortalAuth } from '../context/useAdminPortalAuth.js'
import '../styles/resale-marketplace.css'
import '../styles/seller-marketplace.css'

function MarketplaceReviewPage() {
  const { moderator, logout: moderatorLogout } = useAdminPortalAuth()
  const navigate = useNavigate()

  const [listingsState, setListingsState] = useState({ status: 'idle' })
  const [transactionsState, setTransactionsState] = useState({ status: 'idle' })
  const [notes, setNotes] = useState({})
  const [error, setError] = useState('')
  const [busyListingId, setBusyListingId] = useState(null)

  async function loadPending() {
    setListingsState({ status: 'loading' })

    try {
      const { listings } = await api.marketplacePendingListings()
      setListingsState({ status: 'success', listings })
    } catch (requestError) {
      setListingsState({
        status: 'error',
        message: requestError.message || 'Pending listings could not be loaded.',
      })
    }
  }

  const loadTransactions = useCallback(async () => {
    setTransactionsState({ status: 'loading' })

    try {
      const { transactions } = await api.marketplaceTransactions()
      setTransactionsState({ status: 'success', transactions })
    } catch (requestError) {
      setTransactionsState({
        status: 'error',
        message: requestError.message || 'Simulated transactions could not be loaded.',
      })
    }
  }, [])

  useEffect(() => {
    if (!moderator) return undefined

    let active = true

    api.marketplacePendingListings()
      .then(({ listings }) => {
        if (active) {
          setListingsState({ status: 'success', listings })
        }
      })
      .catch((requestError) => {
        if (active) {
          setListingsState({
            status: 'error',
            message: requestError.message || 'Pending listings could not be loaded.',
          })
        }
      })

    api.marketplaceTransactions()
      .then(({ transactions }) => {
        if (active) {
          setTransactionsState({ status: 'success', transactions })
        }
      })
      .catch((requestError) => {
        if (active) {
          setTransactionsState({
            status: 'error',
            message: requestError.message || 'Simulated transactions could not be loaded.',
          })
        }
      })

    const intervalId = window.setInterval(loadTransactions, 30000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [loadTransactions, moderator])

  async function logout() {
    setError('')

    try {
      await moderatorLogout()
      setListingsState({ status: 'idle' })
      setTransactionsState({ status: 'idle' })
      navigate('/admin-login', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Moderator sign-out failed.')
    }
  }

  async function review(listingId, decision) {
    setError('')
    setBusyListingId(listingId)

    try {
      await api.marketplaceReviewListing(
        listingId,
        decision,
        notes[listingId] || ''
      )

      setListingsState((current) => ({
        ...current,
        listings: current.listings.filter(
          (listing) => listing.id !== listingId
        ),
      }))
    } catch (requestError) {
      setError(requestError.message || 'The listing could not be reviewed.')
    } finally {
      setBusyListingId(null)
    }
  }

  async function verifySeller(listingId) {
    setError('')
    setBusyListingId(listingId)

    try {
      await api.marketplaceVerifySeller(
        listingId,
        'Ownership documents manually reviewed.'
      )

      setListingsState((current) => ({
        ...current,
        listings: current.listings.map((listing) =>
          listing.id === listingId
            ? { ...listing, seller_verification_status: 'VERIFIED' }
            : listing
        ),
      }))
    } catch (requestError) {
      setError(requestError.message || 'Seller verification could not be saved.')
    } finally {
      setBusyListingId(null)
    }
  }

  return (
    <main className="customer-marketplace resale-review-page">
      <header className="customer-header resale-moderator-header">
        <Link
          aria-label="VMA Drive Market home"
          className="customer-brand"
          to="/"
        >
          <span className="customer-brand-mark">
            <ShieldCheck aria-hidden="true" size={21} />
          </span>
          <span className="customer-brand-copy">
            <strong>VMA</strong>
            <small>LISTING REVIEW</small>
          </span>
        </Link>

        {moderator && (
          <div className="resale-review-meta admin-review-header-actions">
            <strong>{moderator.email}</strong>

            <Link className="admin-review-back-button" to="/admin">
              <ArrowLeft aria-hidden="true" size={15} />
              Back to Admin Overview
            </Link>

            <button
              className="resale-quiet-button"
              onClick={logout}
              type="button"
            >
              <LogOut aria-hidden="true" size={14} />
              Sign out
            </button>
          </div>
        )}
      </header>

      <div className="resale-review-shell">
        <div className="resale-page-heading">
          <span className="customer-eyebrow">
            <span className="customer-eyebrow-dot" />
            SEPARATE MARKETPLACE MODERATION
          </span>

          <h1>Review seller listings.</h1>

          <p>
            Only approved active listings become visible to signed-in buyers.
            This review console is separate from the existing Admin Dashboard.
          </p>
        </div>

        {moderator && (
          <>
            <section
              aria-label="Pending listing reviews"
              className="resale-review-list"
            >
              <div className="resale-seller-cta">
                <span>Pending verification queue</span>

                <button
                  className="resale-quiet-button"
                  onClick={loadPending}
                  type="button"
                >
                  <RefreshCw aria-hidden="true" size={14} />
                  Refresh queue
                </button>
              </div>

              {error && (
                <p className="resale-form-error" role="alert">
                  {error}
                </p>
              )}

              {listingsState.status === 'loading' && (
                <p className="resale-state" role="status">
                  Loading pending submissions…
                </p>
              )}

              {listingsState.status === 'error' && (
                <p className="resale-state is-error" role="alert">
                  {listingsState.message}
                </p>
              )}

              {listingsState.status === 'success' &&
                listingsState.listings.length === 0 && (
                  <div className="resale-empty-state">
                    <Check aria-hidden="true" size={26} />
                    <strong>No listings are waiting for review.</strong>
                  </div>
                )}

              {listingsState.status === 'success' &&
                listingsState.listings.map((listing) => (
                  <article className="resale-moderator-card" key={listing.id}>
                    <div>
                      <h2>
                        {listing.manufacturing_year} {listing.brand}{' '}
                        {listing.model}
                      </h2>

                      <div className="resale-review-meta">
                        <span>
                          {listing.price_currency}{' '}
                          {Number(listing.asking_price).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>

                        <span>
                          {listing.fuel_type} · {listing.transmission}
                        </span>

                        <span>
                          {Number(listing.kilometres_driven).toLocaleString()} km
                          {' · '}
                          {listing.location}
                        </span>

                        <span>
                          Seller: {listing.seller?.name || 'Not available'}
                          {' · '}
                          {listing.seller?.email || 'Not available'}
                        </span>

                        <span>
                          Seller verification:{' '}
                          {listing.seller_verification_status}
                        </span>
                      </div>

                      <p className="resale-detail-description">
                        {listing.description}
                      </p>

                      <div className="resale-review-documents">
                        <strong>
                          Private ownership documents · manual review required
                        </strong>

                        {listing.ownership_document_ids?.map(
                          (documentId, index) => (
                            <a
                              href={api.marketplaceOwnershipDocumentUrl(
                                listing.id,
                                documentId
                              )}
                              key={documentId}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Open ownership document {index + 1}
                            </a>
                          )
                        )}

                        <p className="resale-form-help">
                          Uploaded documents are evidence for your review,
                          not automatic proof of ownership.
                        </p>
                      </div>

                      <label className="resale-field">
                        <span>
                          Review note (optional; visible to seller)
                        </span>

                        <textarea
                          className="resale-review-note"
                          maxLength="1000"
                          onChange={(event) =>
                            setNotes((current) => ({
                              ...current,
                              [listing.id]: event.target.value,
                            }))
                          }
                          value={notes[listing.id] || ''}
                        />
                      </label>

                      <div className="resale-review-actions">
                        <button
                          className="resale-quiet-button"
                          disabled={
                            busyListingId === listing.id ||
                            listing.seller_verification_status === 'VERIFIED'
                          }
                          onClick={() => verifySeller(listing.id)}
                          type="button"
                        >
                          {listing.seller_verification_status === 'VERIFIED'
                            ? 'Seller verified'
                            : 'Verify seller documents'}
                        </button>

                        <button
                          className="resale-primary-link resale-approve-button"
                          disabled={
                            busyListingId === listing.id ||
                            listing.seller_verification_status !== 'VERIFIED'
                          }
                          onClick={() => review(listing.id, 'approve')}
                          type="button"
                        >
                          <Check aria-hidden="true" size={15} />
                          Approve active
                        </button>

                        <button
                          className="resale-danger-button"
                          disabled={busyListingId === listing.id}
                          onClick={() => review(listing.id, 'reject')}
                          type="button"
                        >
                          <X aria-hidden="true" size={15} />
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="resale-review-photo-grid">
                      {listing.photo_ids.map((photoId) => (
                        <img
                          alt={`${listing.brand} ${listing.model} submitted photo`}
                          className="resale-review-photo"
                          crossOrigin="use-credentials"
                          key={photoId}
                          src={api.marketplacePhotoUrl(
                            listing.id,
                            photoId
                          )}
                        />
                      ))}
                    </div>
                  </article>
                ))}
            </section>

            <section
              aria-label="Simulated purchase notifications"
              className="resale-review-list"
            >
              <div className="resale-seller-cta">
                <span>Simulated purchase notifications</span>

                <button
                  className="resale-quiet-button"
                  onClick={loadTransactions}
                  type="button"
                >
                  <RefreshCw aria-hidden="true" size={14} />
                  Refresh transactions
                </button>
              </div>

              <p className="resale-form-help">
                SIMULATED ONLY · No real payment was processed or transferred.
              </p>

              {transactionsState.status === 'loading' && (
                <p className="resale-state" role="status">
                  Loading transaction notifications…
                </p>
              )}

              {transactionsState.status === 'error' && (
                <p className="resale-state is-error" role="alert">
                  {transactionsState.message}
                </p>
              )}

              {transactionsState.status === 'success' &&
                transactionsState.transactions.length === 0 && (
                  <div className="resale-empty-state">
                    <strong>
                      No simulated purchases have been recorded.
                    </strong>
                  </div>
                )}

              {transactionsState.status === 'success' &&
                transactionsState.transactions.map((transaction) => (
                  <article
                    className="resale-transaction-card"
                    key={transaction.transaction_id}
                  >
                    <strong>{transaction.vehicle}</strong>

                    <span>
                      Transaction ID: {transaction.transaction_id}
                    </span>

                    <span>
                      Buyer: {transaction.buyer} · Seller: {transaction.seller}
                    </span>

                    <span>
                      SIMULATED {transaction.price_currency}{' '}
                      {Number(transaction.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {' · '}
                      {transaction.status}
                    </span>

                    <time dateTime={transaction.timestamp}>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </time>
                  </article>
                ))}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default MarketplaceReviewPage
