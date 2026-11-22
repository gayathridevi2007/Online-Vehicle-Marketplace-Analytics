import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react'
import { WhiteMarketplaceHeader } from '../components/WhiteMarketplaceHeader.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/white-marketplace.css'

export default function BuyerBookingsPage() {
  const { account } = useCustomerAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!account) {
      setLoading(false)
      return
    }
    api.marketplaceMyBookings()
      .then((data) => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [account])

  return (
    <div className="white-marketplace-theme">
      <WhiteMarketplaceHeader />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px 80px', width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link to="/buyer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft size={14} /> Back to Buyer Marketplace
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Vehicle Reservation & Booking History
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
            Review your 50% deposit vehicle reservations and payment schedules.
          </p>
        </div>

        {/* DEMO NOTICE BANNER */}
        <div className="w-demo-payment-banner" style={{ marginBottom: '28px' }}>
          <AlertTriangle size={24} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div className="w-demo-banner-text">
            <strong>DEMO PAYMENT — NO REAL MONEY TRANSFERRED</strong>
            <p>
              All vehicle bookings recorded here are simulated demonstration transactions. No funds have been transferred from any bank accounts.
            </p>
          </div>
        </div>

        {!account ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '48px 24px', textAlign: 'center' }}>
            <ShoppingBag size={44} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>Sign in to view your bookings</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Track your vehicle bookings, deposit receipts, and delivery balances.</p>
            <Link to="/buyer/login" className="w-btn w-btn-primary">Buyer Sign In</Link>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <Clock size={36} className="animate-pulse" style={{ margin: '0 auto 12px' }} />
            <p>Loading your booking history…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '48px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={44} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>No vehicle bookings yet</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Browse approved seller vehicles in the marketplace and reserve your car with a 50% deposit.</p>
            <Link to="/buyer" className="w-btn w-btn-primary">Explore Vehicles</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {bookings.map((b) => (
              <article key={b.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '22px', boxShadow: 'var(--w-shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {b.payment_status}
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '6px 0 2px 0' }}>
                      {b.vehicle}
                    </h2>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Booking Reference: <strong style={{ color: '#0f172a' }}>{b.booking_reference}</strong> · Ref: <code>{b.demo_payment_reference}</code>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a' }}>
                      ₹{Number(b.deposit_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>50% Deposit Paid (Demo)</span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Total Vehicle Price</span>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      ₹{Number(b.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Remaining 50% Balance</span>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#ea580c' }}>
                      ₹{Number(b.remaining_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Seller Information</span>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#334155' }}>
                      {b.seller_name} ({b.seller_email})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Booking Timestamp</span>
                    <div style={{ fontSize: '13px', color: '#334155' }}>
                      {new Date(b.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
