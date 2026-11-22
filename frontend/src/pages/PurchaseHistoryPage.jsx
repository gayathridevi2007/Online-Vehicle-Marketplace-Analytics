import { useEffect, useState } from 'react'
import { ArrowRight, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import CustomerHeader from '../components/CustomerHeader.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/customer-marketplace.css'
import '../styles/resale-marketplace.css'

function PurchaseHistoryPage() {
  const { account, status: authStatus } = useCustomerAuth()
  const [state, setState] = useState({ status: 'idle' })

  useEffect(() => {
    if (!account) return undefined
    let active = true
    api.marketplaceMyPurchases()
      .then(({ purchases }) => {
        if (active) setState({ status: 'success', purchases })
      })
      .catch((error) => {
        if (active) setState({
          status: 'error',
          message: error.message || 'Purchase history could not be loaded.',
        })
      })
    return () => { active = false }
  }, [account])

  return (
    <main className="customer-marketplace">
      <CustomerHeader />
      <div className="resale-page-shell">
        <div className="resale-page-heading">
          <span className="customer-eyebrow"><span className="customer-eyebrow-dot" /> CUSTOMER MARKETPLACE</span>
          <h1>Purchase history.</h1>
          <p>Review simulated purchase records associated with your account. A simulation is not a real payment or confirmed sale.</p>
        </div>
        {authStatus === 'loading' && <p className="resale-state" role="status">Checking your account…</p>}
        {authStatus === 'error' && <p className="resale-state is-error" role="alert">Customer account service is unavailable.</p>}
        {authStatus === 'ready' && !account && (
          <div className="resale-locked-card">
            <div><h2>Sign in to view your purchases</h2><p>Purchase records are private to the buyer account.</p></div>
            <Link className="resale-primary-link" to="/login">Sign in <ArrowRight size={14} /></Link>
          </div>
        )}
        {account && state.status === 'idle' && <p className="resale-state" role="status">Loading purchase history…</p>}
        {account && state.status === 'error' && <p className="resale-state is-error" role="alert">{state.message}</p>}
        {account && state.status === 'success' && state.purchases.length === 0 && (
          <div className="resale-empty-state">
            <ReceiptText aria-hidden="true" size={27} />
            <strong>No purchase simulations are recorded for this account.</strong>
            <Link className="resale-primary-link" to="/#resale-marketplace">Browse approved cars <ArrowRight size={14} /></Link>
          </div>
        )}
        {account && state.status === 'success' && state.purchases.map((purchase) => (
          <article className="resale-transaction-card" key={purchase.transaction_id}>
            <strong>{purchase.vehicle}</strong>
            <span>Transaction ID: {purchase.transaction_id}</span>
            <span>Seller: {purchase.seller || 'Not available'}</span>
            <span>SIMULATED {purchase.price_currency} {Number(purchase.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · {purchase.status}</span>
            <time dateTime={purchase.timestamp}>{new Date(purchase.timestamp).toLocaleString()}</time>
          </article>
        ))}
      </div>
    </main>
  )
}

export default PurchaseHistoryPage
