import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  Calendar,
  CarFront,
  Fuel,
  Gauge,
  MapPin,
  RotateCcw,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CustomerHeader from '../components/CustomerHeader.jsx'
import InteractiveCarStudio from '../components/InteractiveCarStudio.jsx'
import ResaleListingsSection from '../components/ResaleListingsSection.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.js'
import { api } from '../services/api.js'
import '../styles/customer-marketplace.css'

const PRICE_FIELDS = [
  { key: 'combined_cars_selling_price_raw', label: 'Selling_Price' },
  { key: 'combined_cars_present_price_raw', label: 'Present_Price' },
  { key: 'combined_cars2_price_raw', label: 'price' },
  { key: 'combined_cars3_selling_price_raw', label: 'selling_price' },
]

function displayValue(value) {
  return value === null || value === undefined || value === ''
    ? 'Not available'
    : String(value)
}

function getModelImage(images, vehicle) {
  if (!vehicle.brand || !vehicle.model) return null
  const key = `${vehicle.brand.trim()}|${vehicle.model.trim()}`.toLocaleLowerCase()
  return images.get(key) || null
}

function VehicleImage({ image, vehicle }) {
  const [failedImage, setFailedImage] = useState(null)
  const label = [vehicle.brand, vehicle.model].filter(Boolean).join(' ')

  if (image && failedImage !== image.image) {
    return (
      <div className="customer-vehicle-image">
        <img
          alt={`${label} vehicle`}
          onError={() => setFailedImage(image.image)}
          src={image.image}
        />
        <span className="customer-image-credit">Verified Vehicle Photograph</span>
      </div>
    )
  }

  return (
    <div
      aria-label={`${label || 'Vehicle'} visual card`}
      className="customer-vehicle-image"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0e1726 0%, #162438 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(98, 220, 233, 0.15)',
        minHeight: '140px',
      }}
    >
      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(98, 220, 233, 0.15)', color: '#62dce9', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
        STAR FACT
      </div>
      <CarFront size={44} strokeWidth={1.2} style={{ color: '#70a9ff', marginBottom: '6px' }} />
      <span style={{ fontSize: '11px', fontWeight: '600', color: '#e2ebf5' }}>{vehicle.brand || 'Verified Vehicle'}</span>
      <span style={{ fontSize: '9px', color: '#9aa9bd' }}>{vehicle.model || vehicle.full_model_name || 'Star Warehouse Record'}</span>
    </div>
  )
}

function sourcePrice(vehicle) {
  const field = PRICE_FIELDS.find(({ key }) => (
    vehicle[key] !== null && vehicle[key] !== undefined && vehicle[key] !== ''
  ))
  return field ? { ...field, value: vehicle[field.key] } : null
}

function VehicleDetailsDialog({ image, onClose, vehicle }) {
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

  const title = [vehicle.vehicle_year, vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Vehicle Details'

  const primaryPrice = vehicle.combined_cars_selling_price_raw
    || vehicle.combined_cars_present_price_raw
    || vehicle.combined_cars2_price_raw
    || vehicle.combined_cars3_selling_price_raw

  const formattedPrice = primaryPrice !== null && primaryPrice !== undefined
    ? Number.isFinite(Number(primaryPrice))
      ? Number(primaryPrice).toLocaleString()
      : String(primaryPrice)
    : 'Price not recorded'

  return (
    <div
      className="vehicle-dialog-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="vehicle-dialog-title"
        aria-modal="true"
        className="vehicle-dialog"
        role="dialog"
      >
        <header className="vehicle-dialog-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="customer-section-index" style={{ margin: 0 }}>ACCEPTED STAR SCHEMA RECORD</span>
              <span style={{ fontSize: '11px', background: 'rgba(0, 210, 255, 0.15)', color: '#00d2ff', border: '1px solid rgba(0, 210, 255, 0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                FACT KEY #{vehicle.vehicle_marketplace_key}
              </span>
              <span style={{ fontSize: '11px', background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', padding: '2px 8px', borderRadius: '4px' }}>
                {vehicle.source_file_name || 'Warehouse Source'}
              </span>
            </div>
            <h2 id="vehicle-dialog-title" style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              {title}
            </h2>
            {vehicle.full_model_name && vehicle.full_model_name !== vehicle.model && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                {vehicle.full_model_name}
              </p>
            )}
          </div>
          <button
            aria-label="Close vehicle details"
            className="vehicle-dialog-close"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="vehicle-dialog-layout">
          {/* Top Showcase Banner & Valuation Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
            {/* Vehicle Photograph / High-Tech Visual */}
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0, 210, 255, 0.25)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', background: '#090e1a' }}>
              <VehicleImage image={image} vehicle={vehicle} />
              <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(148, 163, 184, 0.12)', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                <span>{image?.attribution || 'Verified Warehouse Vehicle Image'}</span>
                <span>{image?.license || 'CC / Automotive License'}</span>
              </div>
            </div>

            {/* Prominent Raw Price & Summary Card */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(11, 18, 32, 0.95))',
              border: '1px solid rgba(0, 210, 255, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
                    Raw Source Valuation
                  </span>
                  <span style={{ fontSize: '10px', background: 'rgba(0, 210, 255, 0.15)', color: '#00d2ff', border: '1px solid rgba(0, 210, 255, 0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                    Source Preserved
                  </span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#00d2ff', letterSpacing: '-0.02em', margin: '4px 0 8px' }}>
                  {formattedPrice}
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
                  Original numeric valuation preserved exactly as recorded in <strong>{vehicle.source_file_name || 'source CSV'}</strong>. Units and currencies remain unconverted per data-warehouse integrity standards.
                </p>
              </div>

              {/* 4 Quick Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '8px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                    <Fuel size={12} style={{ color: '#00d2ff' }} /> Fuel
                  </span>
                  <strong style={{ fontSize: '13px', color: '#f8fafc', display: 'block', marginTop: '2px' }}>
                    {displayValue(vehicle.fuel_type)}
                  </strong>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '8px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                    <Gauge size={12} style={{ color: '#00d2ff' }} /> Transmission
                  </span>
                  <strong style={{ fontSize: '13px', color: '#f8fafc', display: 'block', marginTop: '2px' }}>
                    {displayValue(vehicle.transmission)}
                  </strong>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '8px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                    <Calendar size={12} style={{ color: '#00d2ff' }} /> Model Year
                  </span>
                  <strong style={{ fontSize: '13px', color: '#f8fafc', display: 'block', marginTop: '2px' }}>
                    {displayValue(vehicle.vehicle_year)}
                  </strong>
                </div>

                <div style={{ background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '8px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                    <MapPin size={12} style={{ color: '#00d2ff' }} /> Location
                  </span>
                  <strong style={{ fontSize: '13px', color: '#70e1b4', display: 'block', marginTop: '2px' }}>
                    {displayValue(vehicle.city)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section A: Technical & Mechanical Specifications */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '12px', padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
              Technical & Mechanical Specifications
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="vehicle-dialog-field">
                <dt>Odometer Distance</dt>
                <dd>{vehicle.odometer_km ? `${Number(vehicle.odometer_km).toLocaleString()} km` : 'Not available'}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Engine Displacement</dt>
                <dd>{displayValue(vehicle.combined_cars3_engine_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Mileage Measure</dt>
                <dd>{displayValue(vehicle.combined_cars3_mileage_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Max Power</dt>
                <dd>{displayValue(vehicle.combined_cars3_max_power_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Seating Capacity</dt>
                <dd>{displayValue(vehicle.combined_cars3_seats_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Previous Owners</dt>
                <dd>{displayValue(vehicle.combined_cars_owner_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Vehicle Age</dt>
                <dd>{displayValue(vehicle.combined_cars2_car_age_raw || vehicle.combined_cars3_vehicle_age_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Seller Classification</dt>
                <dd>{displayValue(vehicle.seller_type)}</dd>
              </div>
            </div>
          </div>

          {/* Section B: Data Warehouse Lineage & Origin */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '12px', padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
              Star Schema Provenance & Source Record Audit
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
              <div className="vehicle-dialog-field">
                <dt>Warehouse Fact Key</dt>
                <dd style={{ color: '#00d2ff' }}>star.fact_vehicle_marketplace #{vehicle.vehicle_marketplace_key}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Source CSV File</dt>
                <dd>{displayValue(vehicle.source_file_name)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Dataset Group</dt>
                <dd>{displayValue(vehicle.source_name)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Source Record Ordinal</dt>
                <dd>{displayValue(vehicle.source_record_ordinal)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Original Identifier Field</dt>
                <dd>{displayValue(vehicle.source_row_identifier_field)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Original Identifier Value</dt>
                <dd>{displayValue(vehicle.source_row_identifier_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>Present_Price (raw)</dt>
                <dd>{displayValue(vehicle.combined_cars_present_price_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>price (raw, cars2)</dt>
                <dd>{displayValue(vehicle.combined_cars2_price_raw)}</dd>
              </div>
              <div className="vehicle-dialog-field">
                <dt>selling_price (raw, cars3)</dt>
                <dd>{displayValue(vehicle.combined_cars3_selling_price_raw)}</dd>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function CustomerMarketplacePage() {
  const { account, status: authStatus } = useCustomerAuth()
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    fuel_type: '',
    transmission: '',
    city: '',
    state: '',
    min_price: '',
    max_price: '',
  })
  const [page, setPage] = useState(1)
  const [catalogueState, setCatalogueState] = useState({ status: 'loading' })
  const [imageMapState, setImageMapState] = useState({ status: 'loading' })
  const [dynamicOptions, setDynamicOptions] = useState({
    brands: [],
    models: [],
    years: [],
    fuel_types: [],
    transmissions: [],
    cities: [],
    states: [],
  })
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const closeDetails = useCallback(() => setSelectedVehicle(null), [])

  useEffect(() => {
    let active = true
    api.vehicleFilterOptions(filters.brand)
      .then((data) => {
        if (active && data) {
          setDynamicOptions({
            brands: data.brands || [],
            models: data.models || [],
            years: data.years || [],
            fuel_types: data.fuel_types || [],
            transmissions: data.transmissions || ['Automatic', 'Manual'],
            cities: data.cities || [],
            states: data.states || [],
          })
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [filters.brand])

  useEffect(() => {
    let active = true
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    api.vehicleRecords({ ...activeFilters, page, per_page: 18 })
      .then((data) => {
        if (!active) return
        setCatalogueState({ status: 'success', data })
      })
      .catch((error) => {
        if (!active) return
        setCatalogueState({
          status: 'error',
          message: error.message || 'The verified customer catalogue is unavailable.',
        })
      })
    return () => { active = false }
  }, [filters, page, refreshKey])

  useEffect(() => {
    let active = true
    fetch('/vehicle-image-map.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Image mapping could not be loaded (HTTP ${response.status}).`)
        }
        return response.json()
      })
      .then((payload) => {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
          throw new Error('The vehicle image mapping has an invalid format.')
        }
        const entries = Object.entries(payload).filter(([, value]) => (
          value && typeof value.image === 'string'
        ))
        if (active) setImageMapState({ status: 'success', images: entries })
      })
      .catch((error) => {
        if (active) setImageMapState({ status: 'error', message: error.message })
      })
    return () => { active = false }
  }, [])

  const images = useMemo(() => new Map(
    (imageMapState.images || []).map(([key, value]) => [key.toLocaleLowerCase(), value]),
  ), [imageMapState.images])
  const data = catalogueState.status === 'success' ? catalogueState.data : null
  const records = data?.records || []
  const pagination = data?.pagination
  const activeFiltersCount = Object.values(filters).filter((v) => v !== '').length

  function updateFilter(name, value) {
    setSelectedVehicle(null)
    setPage(1)
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === 'brand' ? { model: '' } : {}),
      ...(name === 'state' ? { city: '' } : {}),
    }))
  }

  function clearFilters() {
    setSelectedVehicle(null)
    setPage(1)
    setFilters({
      brand: '',
      model: '',
      year: '',
      fuel_type: '',
      transmission: '',
      city: '',
      state: '',
      min_price: '',
      max_price: '',
    })
  }

  function retryCatalogue() {
    setCatalogueState({ status: 'loading' })
    setRefreshKey((key) => key + 1)
  }

  return (
    <main className="customer-marketplace">
      <CustomerHeader />

      <section aria-labelledby="customer-hero-title" className="customer-hero">
        <div className="customer-hero-copy">
          <span className="customer-eyebrow">
            <span className="customer-eyebrow-dot" />
            17,437 VERIFIED VEHICLE RECORDS
          </span>
          <h1 id="customer-hero-title">
            Find your next
            <span> drive.</span>
          </h1>
          <p>
            Explore verified marketplace vehicles from our dimensional Star Schema warehouse.
            Filter by brand, model, year, transmission, fuel, and location with transparent source pricing.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '14px 0' }}>
            <a className="customer-hero-action" href="#vehicle-catalogue">
              Explore 17,437 Vehicles
              <ArrowDownRight aria-hidden="true" size={17} />
            </a>
            <Link className="customer-hero-action resale-home-sell-link" to="/sell-car">
              Sell Your Car
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <Link className="customer-hero-action" style={{ background: 'rgba(21, 32, 49, 0.8)', border: '1px solid rgba(151, 175, 207, 0.2)' }} to="/admin-login">
              Staff Sign In
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <div className="customer-hero-note">
            <span className="customer-note-line" />
            Raw source pricing preserved without currency conversion. Traceable to original dataset rows.
          </div>
        </div>

        <InteractiveCarStudio />
      </section>

      <section
        aria-labelledby="vehicle-catalogue-title"
        className="customer-section customer-catalogue-section"
        id="vehicle-catalogue"
      >
        <div className="customer-section-heading">
          <span className="customer-section-index">01 / VERIFIED DATA</span>
          <h2 id="vehicle-catalogue-title">Verified Vehicle Catalogue</h2>
          <p>Browse 17,437 accepted Star Schema records. Filter by brand, model, fuel type, transmission, location, and price.</p>
        </div>

        <div className="customer-catalogue-toolbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          <label className="customer-filter-field">
            <span>Brand</span>
            <select
              aria-label="Filter vehicles by brand"
              onChange={(event) => updateFilter('brand', event.target.value)}
              value={filters.brand}
            >
              <option value="">All Brands</option>
              {dynamicOptions.brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </label>
          <label className="customer-filter-field">
            <span>Model</span>
            <select
              aria-label="Filter vehicles by model"
              onChange={(event) => updateFilter('model', event.target.value)}
              value={filters.model}
            >
              <option value="">All Models</option>
              {dynamicOptions.models.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </label>
          <label className="customer-filter-field">
            <span>Manufacturing year</span>
            <select
              aria-label="Filter vehicles by manufacturing year"
              onChange={(event) => updateFilter('year', event.target.value)}
              value={filters.year}
            >
              <option value="">All Years</option>
              {dynamicOptions.years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <label className="customer-filter-field">
            <span>Fuel Type</span>
            <select
              aria-label="Filter vehicles by fuel type"
              onChange={(event) => updateFilter('fuel_type', event.target.value)}
              value={filters.fuel_type}
            >
              <option value="">All Fuel Types</option>
              {dynamicOptions.fuel_types.map((fuel) => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
            </select>
          </label>
          <label className="customer-filter-field">
            <span>Transmission</span>
            <select
              aria-label="Filter vehicles by transmission"
              onChange={(event) => updateFilter('transmission', event.target.value)}
              value={filters.transmission}
            >
              <option value="">All Transmissions</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </label>
          <label className="customer-filter-field">
            <span>State / Location</span>
            <select
              aria-label="Filter vehicles by state or location"
              onChange={(event) => updateFilter('state', event.target.value)}
              value={filters.state}
            >
              <option value="">All Locations</option>
              <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
              <option value="Maharashtra">Maharashtra (Mumbai, Pune, Thane)</option>
              <option value="Karnataka">Karnataka (Bangalore)</option>
              <option value="Telangana">Telangana (Hyderabad)</option>
              <option value="Delhi NCR">Delhi NCR (Delhi, Noida)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (Lucknow, Agra)</option>
              <option value="Haryana">Haryana (Faridabad, Panchkula)</option>
              <option value="Uttarakhand">Uttarakhand (Dehradun)</option>
            </select>
          </label>
          <label className="customer-filter-field">
            <span>Min Price</span>
            <input
              aria-label="Minimum raw price"
              onChange={(event) => updateFilter('min_price', event.target.value)}
              placeholder="e.g. 100000"
              style={{ background: 'rgba(11, 18, 30, 0.8)', border: '1px solid rgba(151, 175, 207, 0.15)', borderRadius: '6px', color: '#e2ebf5', padding: '6px 10px', fontSize: '11px' }}
              type="number"
              value={filters.min_price}
            />
          </label>
          <label className="customer-filter-field">
            <span>Max Price</span>
            <input
              aria-label="Maximum raw price"
              onChange={(event) => updateFilter('max_price', event.target.value)}
              placeholder="e.g. 2000000"
              style={{ background: 'rgba(11, 18, 30, 0.8)', border: '1px solid rgba(151, 175, 207, 0.15)', borderRadius: '6px', color: '#e2ebf5', padding: '6px 10px', fontSize: '11px' }}
              type="number"
              value={filters.max_price}
            />
          </label>
          {activeFiltersCount > 0 && (
            <button className="customer-clear-filters" onClick={clearFilters} style={{ gridColumn: '1 / -1', width: 'fit-content' }} type="button">
              <RotateCcw aria-hidden="true" size={14} />
              Clear filters ({activeFiltersCount})
            </button>
          )}
          {catalogueState.status === 'success' && (
            <p aria-live="polite" className="customer-record-count" style={{ gridColumn: '1 / -1', margin: '4px 0' }}>
              Showing <strong>{records.length}</strong> of{' '}
              <strong>{pagination?.total_records?.toLocaleString() || 17437}</strong> matching accepted warehouse records (Page {page} of {pagination?.total_pages || 1})
            </p>
          )}
        </div>

        {imageMapState.status === 'error' && (
          <p className="customer-image-map-warning" role="status">
            {imageMapState.message} Vehicle images will use verified SVG badge fallbacks.
          </p>
        )}

        {catalogueState.status === 'loading' && (
          <div className="customer-catalogue-state" role="status">
            Loading verified vehicle records from Star Schema…
          </div>
        )}

        {catalogueState.status === 'error' && (
          <div className="customer-catalogue-state is-error" role="alert">
            <p>{catalogueState.message}</p>
            <button
              className="customer-retry-button"
              onClick={retryCatalogue}
              type="button"
            >
              Retry catalogue
            </button>
          </div>
        )}

        {catalogueState.status === 'success' && records.length === 0 && (
          <div className="customer-catalogue-state" role="status">
            No accepted vehicle records match these filters. Try broadening your criteria.
          </div>
        )}

        {catalogueState.status === 'success' && records.length > 0 && (
          <>
            <p className="customer-catalogue-disclaimer">
              Source prices are shown in their original numeric scale. Currency and units are not assumed. Click any vehicle to inspect all 26 lineage and technical attributes.
            </p>
            <div className="customer-vehicle-grid">
              {records.map((vehicle, index) => {
                const image = getModelImage(images, vehicle)
                const price = sourcePrice(vehicle)
                const title = [vehicle.brand, vehicle.model]
                  .filter(Boolean)
                  .join(' ') || 'Vehicle details'

                return (
                  <article
                    className="customer-vehicle-card"
                    key={`${vehicle.source_file_name}:${vehicle.source_record_ordinal}:${vehicle.vehicle_marketplace_key || index}`}
                  >
                    <VehicleImage image={image} vehicle={vehicle} />
                    <div className="customer-vehicle-card-content">
                      <div className="customer-vehicle-heading">
                        <span>{displayValue(vehicle.brand)}</span>
                        <h3>{displayValue(vehicle.model || vehicle.full_model_name)}</h3>
                        <p>{displayValue(vehicle.full_model_name)}</p>
                      </div>

                      <div className="customer-vehicle-price">
                        <span>{price ? `Source field · ${price.label}` : 'Source price'}</span>
                        <strong>{price ? displayValue(price.value) : 'Not available'}</strong>
                        <small>Raw numeric value · unit unverified</small>
                      </div>

                      <dl className="customer-vehicle-facts">
                        <div>
                          <dt>Year</dt>
                          <dd>{displayValue(vehicle.vehicle_year)}</dd>
                        </div>
                        <div>
                          <dt>Fuel</dt>
                          <dd>{displayValue(vehicle.fuel_type)}</dd>
                        </div>
                        <div>
                          <dt>Transmission</dt>
                          <dd>{displayValue(vehicle.transmission)}</dd>
                        </div>
                        <div>
                          <dt>Location</dt>
                          <dd style={{ color: '#70e1b4' }}>{displayValue(vehicle.city)}</dd>
                        </div>
                        <div>
                          <dt>Distance</dt>
                          <dd>
                            {vehicle.odometer_km === null || vehicle.odometer_km === undefined
                              ? 'Not available'
                              : `${displayValue(vehicle.odometer_km)} km`}
                          </dd>
                        </div>
                      </dl>

                      <p className="customer-vehicle-source">
                        {displayValue(vehicle.source_file_name)} · {displayValue(vehicle.source_name)}
                      </p>
                      <button
                        className="customer-view-details"
                        onClick={() => setSelectedVehicle(vehicle)}
                        type="button"
                      >
                        View Full Record
                        <ArrowRight aria-hidden="true" size={15} />
                      </button>
                    </div>
                    <span className="sr-only">{title}</span>
                  </article>
                )
              })}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                <button
                  className="analytics-button"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1))
                    document.getElementById('vehicle-catalogue')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  type="button"
                >
                  Previous
                </button>
                <span style={{ fontSize: '11px', color: '#9aa9bd' }}>
                  Page {page} of {pagination.total_pages}
                </span>
                <button
                  className="analytics-button"
                  disabled={page >= pagination.total_pages}
                  onClick={() => {
                    setPage((p) => Math.min(pagination.total_pages, p + 1))
                    document.getElementById('vehicle-catalogue')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ResaleListingsSection account={account} authStatus={authStatus} />

      <section aria-label="Featured vehicles" className="customer-section customer-featured-section">
        <div className="customer-section-heading">
          <span className="customer-section-index">03 / NEXT PHASE</span>
          <h2>Featured listings</h2>
          <p>Curated active listings will require a verified customer marketplace source.</p>
        </div>
        <div className="customer-featured-empty">
          <span className="customer-featured-icon"><CarFront aria-hidden="true" size={20} /></span>
          <div>
            <strong>No featured active listings</strong>
            <p>The warehouse records above are not represented as current marketplace inventory.</p>
          </div>
          <span className="customer-featured-tag">LISTING STATUS UNVERIFIED</span>
        </div>
      </section>

      <footer className="customer-footer">
        <span>VMA DRIVE MARKET</span>
        <span>Source-aware · built in stages</span>
      </footer>

      {selectedVehicle && (
        <VehicleDetailsDialog
          image={getModelImage(images, selectedVehicle)}
          onClose={closeDetails}
          vehicle={selectedVehicle}
        />
      )}
    </main>
  )
}

export default CustomerMarketplacePage
