import { useState } from 'react'
import { Calendar, Fuel, Gauge, Heart, MapPin, ShieldCheck } from 'lucide-react'
import { getVehiclePhotoUrl } from '../utils/vehicleImages.js'

export function WhiteVehicleCard({
  vehicle,
  onBook,
  onInspect,
  isFavourite = false,
  onToggleFavourite,
  isComparing = false,
  onToggleCompare,
}) {
  const [imgSrc, setImgSrc] = useState(getVehiclePhotoUrl(vehicle))
  const [imgFailed, setImgFailed] = useState(false)

  const brand = vehicle.brand || 'Vehicle'
  const model = vehicle.model || 'Model'
  const year = vehicle.manufacturing_year || vehicle.year || 2022
  const price = Number(vehicle.asking_price || vehicle.price || 0)
  const deposit = (price * 0.5).toFixed(2)
  const km = Number(vehicle.kilometres_driven || vehicle.km_driven || 0)
  const fuel = vehicle.fuel_type || 'Petrol'
  const trans = vehicle.transmission || 'Manual'
  const location = vehicle.location || 'India'

  function handleImgError() {
    if (!imgFailed) {
      setImgFailed(true)
      setImgSrc('/vehicles/Maruti_Swift.jpg')
    }
  }

  return (
    <article className="w-vehicle-card">
      <div className="w-card-media">
        <img
          src={imgSrc}
          alt={`${year} ${brand} ${model}`}
          className="w-card-img"
          onError={handleImgError}
          crossOrigin="use-credentials"
        />
        <div className="w-card-badge-row">
          <span className="w-badge-tag">{year}</span>
          <span className="w-badge-verified">
            <ShieldCheck size={11} /> Verified Seller
          </span>
        </div>

        {onToggleFavourite && (
          <button
            type="button"
            className={`w-card-fav-btn ${isFavourite ? 'is-favourite' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavourite(vehicle)
            }}
            title={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
            aria-label={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
          >
            <Heart size={16} fill={isFavourite ? '#dc2626' : 'none'} />
          </button>
        )}
      </div>

      <div className="w-card-body">
        <div className="w-card-header">
          <h3 className="w-card-title" title={`${year} ${brand} ${model}`}>
            {brand} {model}
          </h3>
          <div className="w-card-location">
            <MapPin size={13} />
            <span>{location}</span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="w-specs-grid">
          <div className="w-spec-item">
            <span className="w-spec-label"><Gauge size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> Mileage</span>
            <span className="w-spec-val">{km > 0 ? `${km.toLocaleString()} km` : 'Pre-owned'}</span>
          </div>
          <div className="w-spec-item">
            <span className="w-spec-label"><Fuel size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> Fuel</span>
            <span className="w-spec-val">{fuel}</span>
          </div>
          <div className="w-spec-item">
            <span className="w-spec-label"><Calendar size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> Trans</span>
            <span className="w-spec-val">{trans}</span>
          </div>
        </div>

        {/* Price and Deposit Notice */}
        <div className="w-card-price-row">
          <div>
            <div className="w-card-price-main">
              ₹{price > 0 ? price.toLocaleString('en-IN') : 'Contact for Price'}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Ex-showroom/Asking</span>
          </div>
          {price > 0 && (
            <div className="w-card-deposit-info" title="50% deposit required to book">
              Deposit: ₹{Number(deposit).toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-card-footer">
          {onToggleCompare && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={isComparing}
                onChange={() => onToggleCompare(vehicle)}
                style={{ cursor: 'pointer' }}
              />
              Compare
            </label>
          )}

          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <button
              type="button"
              className="w-btn w-btn-outline w-btn-sm"
              onClick={() => onInspect(vehicle)}
            >
              Details
            </button>
            <button
              type="button"
              className="w-btn w-btn-primary w-btn-sm"
              onClick={() => onBook(vehicle)}
            >
              Book (50%)
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
