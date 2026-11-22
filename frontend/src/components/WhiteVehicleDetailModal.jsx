import { useState } from 'react'
import { Calendar, CheckCircle2, Fuel, Gauge, MapPin, ShieldCheck, UserCheck, X } from 'lucide-react'
import { api } from '../services/api.js'
import { getVehiclePhotoUrl } from '../utils/vehicleImages.js'

export function WhiteVehicleDetailModal({ vehicle, isOpen, onClose, onBook }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  if (!isOpen || !vehicle) return null

  const brand = vehicle.brand || 'Vehicle'
  const model = vehicle.model || 'Model'
  const year = vehicle.manufacturing_year || vehicle.year || 2022
  const price = Number(vehicle.asking_price || vehicle.price || 0)
  const deposit = (price * 0.5).toFixed(2)
  const balance = (price - Number(deposit)).toFixed(2)
  const km = Number(vehicle.kilometres_driven || 0)
  const fuel = vehicle.fuel_type || 'Petrol'
  const trans = vehicle.transmission || 'Manual'
  const location = vehicle.location || 'India'
  const description = vehicle.description || 'Verified automotive listing inspected and approved for purchase.'

  const photoList = vehicle.photo_ids && vehicle.photo_ids.length > 0 && vehicle.id
    ? vehicle.photo_ids.map((id) => api.marketplacePhotoUrl(vehicle.id, id))
    : [getVehiclePhotoUrl(vehicle)]

  return (
    <div className="w-qr-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <div className="w-qr-modal-dialog" style={{ maxWidth: '680px' }}>
        <button className="w-modal-close-btn" onClick={onClose} type="button" aria-label="Close details">
          <X size={18} />
        </button>

        {/* Gallery */}
        <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a', marginBottom: '14px' }}>
          <img
            src={photoList[selectedPhotoIndex] || photoList[0]}
            alt={`${year} ${brand} ${model}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="use-credentials"
          />
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
            <span className="w-badge-tag">{year}</span>
            <span className="w-badge-verified"><ShieldCheck size={12} /> Verified Seller</span>
          </div>
        </div>

        {/* Thumbnails if multiple photos */}
        {photoList.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
            {photoList.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhotoIndex(idx)}
                style={{
                  width: '64px',
                  height: '48px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: idx === selectedPhotoIndex ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'transparent',
                }}
              >
                <img src={url} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="use-credentials" />
              </button>
            ))}
          </div>
        )}

        {/* Vehicle Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 id="detail-modal-title" style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              {year} {brand} {model}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px' }}>
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
              ₹{price.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Asking Price</span>
          </div>
        </div>

        {/* Specs Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Gauge size={12} /> Distance</span>
            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{km.toLocaleString()} km</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Fuel size={12} /> Fuel Type</span>
            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{fuel}</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Transmission</span>
            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{trans}</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><UserCheck size={12} /> Verification</span>
            <strong style={{ fontSize: '13.5px', color: '#16a34a' }}>Approved</strong>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
            Vehicle Overview
          </h4>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {description}
          </p>
        </div>

        {/* 50% Deposit Breakdown Card */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: '#166534', marginBottom: '10px' }}>
            <CheckCircle2 size={16} /> 50% RESERVATION DEPOSIT SCHEDULE
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#166534', marginBottom: '6px' }}>
            <span>Vehicle Total Price:</span>
            <span>₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: '#15803d', marginBottom: '6px' }}>
            <span>Required Demo Deposit (50%):</span>
            <span>₹{Number(deposit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#166534', paddingTop: '6px', borderTop: '1px solid #bbf7d0' }}>
            <span>Remaining 50% Balance on Delivery:</span>
            <span>₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="w-btn w-btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}
          onClick={() => {
            onClose()
            onBook(vehicle)
          }}
          type="button"
        >
          Book Vehicle Now (50% Demo Deposit · ₹{Number(deposit).toLocaleString('en-IN')})
        </button>
      </div>
    </div>
  )
}
