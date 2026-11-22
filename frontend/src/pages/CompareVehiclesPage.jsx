import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CarFront, Check, Gauge, Layers, ShieldCheck, Trash2, X } from 'lucide-react'
import { WhiteMarketplaceHeader } from '../components/WhiteMarketplaceHeader.jsx'
import { QrDemoPaymentModal } from '../components/QrDemoPaymentModal.jsx'
import { getVehiclePhotoUrl } from '../utils/vehicleImages.js'
import { api } from '../services/api.js'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import '../styles/white-marketplace.css'

export default function CompareVehiclesPage() {
  const navigate = useNavigate()
  const { account } = useCustomerAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingVehicle, setBookingVehicle] = useState(null)

  useEffect(() => {
    // Load active listings to populate comparison if empty
    api.marketplaceListings({ per_page: 4, price_currency: 'INR' })
      .then((data) => {
        setVehicles(data.listings?.slice(0, 3) || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function removeVehicle(id) {
    setVehicles((prev) => prev.filter((v) => v.id !== id))
  }

  function startBooking(v) {
    if (!account) {
      navigate('/buyer/login')
      return
    }
    setBookingVehicle(v)
  }

  async function handleConfirmBooking() {
    if (!bookingVehicle) return
    return await api.marketplaceCreateBooking(bookingVehicle.id, 'Demo booking from vehicle comparison.')
  }

  return (
    <div className="white-marketplace-theme">
      <WhiteMarketplaceHeader />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Link to="/buyer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none', marginBottom: '6px' }}>
              <ArrowLeft size={14} /> Back to Buyer Marketplace
            </Link>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Side-by-Side Vehicle Comparison
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
              Compare specifications, mileage, pricing and 50% deposit schedules across verified models.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <Layers size={36} className="animate-pulse" style={{ margin: '0 auto 12px' }} />
            <p>Loading vehicle comparison data…</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '48px 24px', textAlign: 'center' }}>
            <Layers size={44} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>No vehicles selected for comparison</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Select "Compare" on any vehicle cards in the marketplace to compare them here.</p>
            <Link to="/buyer" className="w-btn w-btn-primary">Browse Vehicles to Compare</Link>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflowX: 'auto', boxShadow: 'var(--w-shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '720px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '16px 20px', width: '220px', fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    Specification
                  </th>
                  {vehicles.map((v) => (
                    <th key={v.id} style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>
                          {v.manufacturing_year}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVehicle(v.id)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          title="Remove vehicle"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', background: '#f1f5f9' }}>
                        <img
                          src={getVehiclePhotoUrl(v)}
                          alt={`${v.brand} ${v.model}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          crossOrigin="use-credentials"
                        />
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                        {v.brand} {v.model}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#475569', fontSize: '13.5px' }}>Asking Price</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                      ₹{Number(v.asking_price).toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f0fdf4' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '700', color: '#166534', fontSize: '13.5px' }}>50% Booking Deposit</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '15px', fontWeight: '800', color: '#16a34a' }}>
                      ₹{(Number(v.asking_price) * 0.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#475569', fontSize: '13.5px' }}>Remaining 50% Balance</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                      ₹{(Number(v.asking_price) * 0.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#475569', fontSize: '13.5px' }}>Distance / Mileage</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                      {Number(v.kilometres_driven).toLocaleString()} km
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#475569', fontSize: '13.5px' }}>Fuel Type</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '14px', color: '#334155' }}>
                      {v.fuel_type}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#475569', fontSize: '13.5px' }}>Transmission</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '14px', color: '#334155' }}>
                      {v.transmission}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#475569', fontSize: '13.5px' }}>Location</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '14px', color: '#334155' }}>
                      {v.location}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#475569', fontSize: '13.5px' }}>Verification Status</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '14px 20px', fontSize: '13.5px', color: '#059669', fontWeight: '700' }}>
                      <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                      Verified
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '20px' }}>Action</td>
                  {vehicles.map((v) => (
                    <td key={v.id} style={{ padding: '20px' }}>
                      <button
                        type="button"
                        className="w-btn w-btn-primary w-btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => startBooking(v)}
                      >
                        Book (50% Deposit)
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* QR Demo Booking Modal */}
      <QrDemoPaymentModal
        isOpen={Boolean(bookingVehicle)}
        onClose={() => setBookingVehicle(null)}
        title={`Book ${bookingVehicle?.manufacturing_year || ''} ${bookingVehicle?.brand || ''} ${bookingVehicle?.model || ''}`}
        subtitle="50% Deposit Demonstration Booking"
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
