import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CarFront, Heart, ShieldCheck } from 'lucide-react'
import { WhiteMarketplaceHeader } from '../components/WhiteMarketplaceHeader.jsx'
import { WhiteVehicleCard } from '../components/WhiteVehicleCard.jsx'
import { WhiteVehicleDetailModal } from '../components/WhiteVehicleDetailModal.jsx'
import { QrDemoPaymentModal } from '../components/QrDemoPaymentModal.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/white-marketplace.css'

export default function BuyerFavouritesPage() {
  const navigate = useNavigate()
  const { account } = useCustomerAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [bookingVehicle, setBookingVehicle] = useState(null)

  useEffect(() => {
    if (!account) {
      setLoading(false)
      return
    }
    api.marketplaceFavourites()
      .then((data) => {
        setVehicles(data.listings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [account])

  function toggleFavourite(vehicle) {
    api.marketplaceRemoveFavourite(vehicle.id)
      .then(() => {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id))
      })
      .catch(() => {})
  }

  function startBooking(v) {
    setBookingVehicle(v)
  }

  async function handleConfirmBooking() {
    if (!bookingVehicle) return
    return await api.marketplaceCreateBooking(bookingVehicle.id, 'Demo booking from favourites page.')
  }

  return (
    <div className="white-marketplace-theme">
      <WhiteMarketplaceHeader />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px', width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link to="/buyer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft size={14} /> Back to Buyer Marketplace
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Saved Favourites
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
            Your curated vehicle shortlist stored in your buyer profile.
          </p>
        </div>

        {!account ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '48px 24px', textAlign: 'center' }}>
            <Heart size={44} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>Sign in to view favourites</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Save and compare your dream vehicles across sessions.</p>
            <Link to="/buyer/login" className="w-btn w-btn-primary">Buyer Sign In</Link>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <Heart size={36} className="animate-pulse" style={{ margin: '0 auto 12px' }} />
            <p>Loading your saved favourites…</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '48px 24px', textAlign: 'center' }}>
            <Heart size={44} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>No vehicles saved yet</h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>Click the heart icon on any vehicle card in the marketplace to add it here.</p>
            <Link to="/buyer" className="w-btn w-btn-primary">Browse Vehicles</Link>
          </div>
        ) : (
          <div className="w-vehicle-grid">
            {vehicles.map((v) => (
              <WhiteVehicleCard
                key={v.id}
                vehicle={v}
                isFavourite={true}
                onToggleFavourite={toggleFavourite}
                onInspect={(veh) => setSelectedVehicle(veh)}
                onBook={(veh) => startBooking(veh)}
              />
            ))}
          </div>
        )}
      </main>

      <WhiteVehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        onBook={(v) => startBooking(v)}
      />

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
