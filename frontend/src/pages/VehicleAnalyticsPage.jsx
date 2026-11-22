import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  CarFront,
  Database,
  FileDown,
  Fuel,
  Gauge,
  RefreshCw,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import { api } from '../services/api.js'
import { generateVehicleAnalyticsPdf } from '../services/reportGenerator.js'
import PageContainer from '../components/PageContainer.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/FeedbackStates.jsx'

const INITIAL_ENDPOINT_STATE = { status: 'loading' }
const INITIAL_ANALYTICS = {
  summary: INITIAL_ENDPOINT_STATE,
  brands: INITIAL_ENDPOINT_STATE,
  fuelTypes: INITIAL_ENDPOINT_STATE,
  prices: INITIAL_ENDPOINT_STATE,
}
const CHART_COLORS = ['#62dce9', '#70a9ff', '#a78bfa', '#70e1b4', '#f6a96b', '#f28ba8', '#81d4c8', '#b6a2ff']
const RECORDS_PER_PAGE = 10
const NUMBER_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })

function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return NUMBER_FORMAT.format(Number(value))
}

function describeError(error) {
  if (error?.status === 503 && error.message) return error.message
  if (error?.message && error.message !== 'Failed to fetch') return error.message
  return 'The Flask API could not be reached. Check the backend service and VITE_API_BASE_URL.'
}

async function loadEndpoint(loader) {
  try {
    return { status: 'success', data: await loader() }
  } catch (error) {
    return { status: 'error', message: describeError(error) }
  }
}

function EndpointPanel({ children, description, endpoint, title }) {
  return (
    <section className="analytics-panel">
      <header className="analytics-panel-heading">
        <div>
          <span className="eyebrow">WAREHOUSE ANALYTICS</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </header>
      {endpoint.status === 'loading'
        ? <LoadingState message={`Loading ${title.toLowerCase()}…`} />
        : endpoint.status === 'error'
          ? <ErrorState message={endpoint.message} title={`${title} unavailable`} />
          : children}
    </section>
  )
}

function KpiCard({ detail, icon: Icon, label, value }) {
  return (
    <article className="analytics-kpi-card">
      <div className="analytics-kpi-icon"><Icon aria-hidden="true" size={18} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function MetricCards({ endpoint }) {
  if (endpoint.status === 'loading') {
    return <LoadingState message="Loading warehouse summary…" />
  }
  if (endpoint.status === 'error') {
    return <ErrorState message={endpoint.message} title="Summary unavailable" />
  }
  if (!endpoint.data?.summary) {
    return <EmptyState message="The summary endpoint returned no summary." title="No summary data" />
  }

  const summary = endpoint.data.summary
  const sourceFiles = new Set(
    (endpoint.data.source_counts || [])
      .map((source) => source.source_file_name)
      .filter(Boolean),
  ).size

  return (
    <div className="analytics-kpi-grid">
      <KpiCard detail="Accepted warehouse records" icon={CarFront} label="Vehicle records" value={formatNumber(summary.total_records)} />
      <KpiCard detail="With a supported brand value" icon={Tag} label="Records with brand" value={formatNumber(summary.records_with_brand)} />
      <KpiCard detail="With a supported model value" icon={Database} label="Records with model" value={formatNumber(summary.records_with_model)} />
      <KpiCard detail="With odometer distance in km" icon={Gauge} label="Records with odometer" value={formatNumber(summary.records_with_odometer_km)} />
      <KpiCard detail="Represented in loaded warehouse data" icon={Activity} label="Source files" value={formatNumber(sourceFiles)} />
    </div>
  )
}

function ChartTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="analytics-tooltip">
      <strong>{label || payload[0].payload.label}</strong>
      <span>{formatNumber(payload[0].value)} records</span>
      {payload[0].payload.source_file_name && (
        <small>{payload[0].payload.source_file_name}</small>
      )}
    </div>
  )
}

function SourceFilter({ onChange, sources, value }) {
  return (
    <label className="analytics-source-filter">
      <span>Chart source</span>
      <select aria-label="Filter charts by source" onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">All available sources</option>
        {sources.map((source) => (
          <option key={source} value={source}>{source}</option>
        ))}
      </select>
    </label>
  )
}

function AnalyticsBanner({ states }) {
  const values = Object.values(states)
  const failed = values.filter((state) => state.status === 'error').length
  const loading = values.some((state) => state.status === 'loading')
  if (loading) return null

  if (failed === values.length) {
    return (
      <div className="analytics-status is-unavailable" role="status">
        <Database aria-hidden="true" size={18} />
        <div>
          <strong>Live analytics unavailable</strong>
          <span>PostgreSQL-backed API responses are required. No sample statistics are substituted.</span>
        </div>
      </div>
    )
  }
  if (failed > 0) {
    return (
      <div className="analytics-status is-partial" role="status">
        <Activity aria-hidden="true" size={18} />
        <div>
          <strong>Some analytics could not be loaded</strong>
          <span>Available panels show API data only; failed panels include their own error details.</span>
        </div>
      </div>
    )
  }
  return (
    <div className="analytics-status is-connected" role="status">
      <Activity aria-hidden="true" size={18} />
      <div>
        <strong>Live Star Schema analytics connected</strong>
        <span>Charts and summary values are returned by the existing Flask API.</span>
      </div>
    </div>
  )
}

function numericPriceStats(row) {
  return [
    { statistic: 'Minimum', value: row.min_value },
    { statistic: 'Average', value: row.avg_value },
    { statistic: 'Maximum', value: row.max_value },
  ].filter((statistic) => statistic.value !== null && statistic.value !== undefined)
    .map((statistic) => ({ ...statistic, value: Number(statistic.value) }))
    .filter((statistic) => Number.isFinite(statistic.value))
}

function PriceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="analytics-tooltip">
      <strong>{label}</strong>
      <span>{formatNumber(payload[0].value)} · raw source value</span>
    </div>
  )
}

function PriceAnalysis({ endpoint, sourceFilter }) {
  const rows = endpoint.data?.price_measures || []
  const filtered = sourceFilter
    ? rows.filter((row) => row.source_name === sourceFilter)
    : rows
  if (!filtered.length) {
    return <EmptyState message="No source-specific price measures are available for this selection." title="No price analysis" />
  }

  return (
    <>
      <div className="analytics-price-grid">
        {filtered.map((row) => {
          const stats = numericPriceStats(row)
          const key = `${row.source_file_name}:${row.source_name}:${row.measure}`
          return (
            <article className="analytics-price-card" key={key}>
              <div className="analytics-price-card-heading">
                <span>{row.source_name} · {row.source_file_name}</span>
                <strong>{row.measure}</strong>
                <small>{formatNumber(row.record_count)} non-null source values</small>
              </div>
              {stats.length
                ? (
                  <div className="analytics-price-chart">
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart data={stats} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke="rgba(159, 181, 213, 0.1)" vertical={false} />
                        <XAxis axisLine={false} dataKey="statistic" tick={{ fill: '#9aa9bd', fontSize: 10 }} tickLine={false} />
                        <YAxis axisLine={false} tick={{ fill: '#8191a7', fontSize: 9 }} tickFormatter={formatNumber} tickLine={false} width={66} />
                        <Tooltip content={<PriceTooltip />} cursor={{ fill: 'rgba(112, 169, 255, 0.08)' }} />
                        <Bar dataKey="value" fill="#a78bfa" maxBarSize={38} radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
                : <EmptyState message="The API returned no numeric values for this measure." title="No price values" />}
            </article>
          )
        })}
      </div>
      <p className="analytics-caveat">
        Measures are shown separately in their original numeric scale. Currency and units are unverified; values are not converted or compared across measures.
      </p>
    </>
  )
}

function RecordBrowser({ brandOptions, fuelOptions, refreshKey, summary, brandsList, fuelTypesList }) {
  const [formFilters, setFormFilters] = useState({
    source_name: '',
    source_file_name: '',
    brand: '',
    model: '',
    state: '',
    city: '',
    fuel_type: '',
    transmission: '',
    year_from: '',
    year_to: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({})
  const [page, setPage] = useState(1)
  const [filterError, setFilterError] = useState('')
  const [recordState, setRecordState] = useState(INITIAL_ENDPOINT_STATE)
  const [dynamicOptions, setDynamicOptions] = useState({
    brands: [],
    models: [],
    cities: [],
    states: [],
    transmissions: [],
  })
  const requestKey = JSON.stringify({ appliedFilters, page, refreshKey })

  useEffect(() => {
    let active = true
    api.vehicleFilterOptions(formFilters.brand)
      .then((data) => {
        if (active && data) {
          setDynamicOptions({
            brands: data.brands || [],
            models: data.models || [],
            cities: data.cities || [],
            states: data.states || [],
            transmissions: data.transmissions || ['Automatic', 'Manual'],
          })
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [formFilters.brand])

  useEffect(() => {
    let active = true
    api.vehicleRecords({ ...appliedFilters, page, per_page: RECORDS_PER_PAGE })
      .then((data) => {
        if (active) setRecordState({ status: 'success', data, requestKey })
      })
      .catch((error) => {
        if (active) setRecordState({ status: 'error', message: describeError(error), requestKey })
      })
    return () => { active = false }
  }, [appliedFilters, page, refreshKey, requestKey])

  const currentRecordState = recordState.requestKey === requestKey
    ? recordState
    : INITIAL_ENDPOINT_STATE
  function setField(event) {
    const { name, value } = event.target
    setFormFilters((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'brand' ? { model: '' } : {}),
      ...(name === 'state' ? { city: '' } : {}),
    }))
  }

  function applyFilters(event) {
    event.preventDefault()
    const from = formFilters.year_from.trim()
    const to = formFilters.year_to.trim()
    if (from && to && Number(from) > Number(to)) {
      setFilterError('The starting year must not exceed the ending year.')
      return
    }
    setFilterError('')
    setPage(1)
    setAppliedFilters(
      Object.fromEntries(
        Object.entries(formFilters).filter(([, value]) => value !== ''),
      ),
    )
  }

  function clearFilters() {
    setFormFilters({
      source_name: '',
      source_file_name: '',
      brand: '',
      model: '',
      state: '',
      city: '',
      fuel_type: '',
      transmission: '',
      year_from: '',
      year_to: '',
    })
    setFilterError('')
    setPage(1)
    setAppliedFilters({})
  }

  function handleDownloadPdf() {
    generateVehicleAnalyticsPdf({
      appliedFilters,
      summary,
      records: currentRecordState.data?.records || [],
      brands: brandsList || [],
      fuelTypes: fuelTypesList || [],
    })
  }

  const records = currentRecordState.data?.records || []
  const pagination = currentRecordState.data?.pagination

  return (
    <section className="analytics-panel analytics-record-panel">
      <header className="analytics-panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="eyebrow">FILTERABLE SOURCE RECORDS</span>
          <h3>Warehouse record explorer</h3>
          <p>Filter actual warehouse records across states, brands, models, fuel types, and manufacturing years.</p>
        </div>
        <button
          className="analytics-button is-primary"
          onClick={handleDownloadPdf}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          type="button"
        >
          <FileDown aria-hidden="true" size={15} />
          Generate PDF Report
        </button>
      </header>
      <form className="analytics-filter-form" onSubmit={applyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <label>
          State / Region
          <select name="state" onChange={setField} value={formFilters.state}>
            <option value="">All States & Regions</option>
            <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
            <option value="Maharashtra">Maharashtra (Mumbai, Pune, Thane)</option>
            <option value="Karnataka">Karnataka (Bangalore)</option>
            <option value="Telangana">Telangana (Hyderabad)</option>
            <option value="Delhi NCR">Delhi NCR (Delhi, Noida, Ghaziabad)</option>
            <option value="Uttar Pradesh">Uttar Pradesh (Lucknow, Agra)</option>
            <option value="Haryana">Haryana (Faridabad, Panchkula)</option>
            <option value="Uttarakhand">Uttarakhand (Dehradun)</option>
          </select>
        </label>
        <label>
          City
          <select name="city" onChange={setField} value={formFilters.city}>
            <option value="">All Cities</option>
            {(dynamicOptions.cities || []).map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </label>
        <label>
          Brand
          <select name="brand" onChange={setField} value={formFilters.brand}>
            <option value="">All brands</option>
            {(dynamicOptions.brands?.length ? dynamicOptions.brands : brandOptions).map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </label>
        <label>
          Model
          <select name="model" onChange={setField} value={formFilters.model}>
            <option value="">All models</option>
            {(dynamicOptions.models || []).map((mod) => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
        </label>
        <label>
          Fuel type
          <select name="fuel_type" onChange={setField} value={formFilters.fuel_type}>
            <option value="">All fuel types</option>
            {fuelOptions.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
          </select>
        </label>
        <label>
          Transmission
          <select name="transmission" onChange={setField} value={formFilters.transmission}>
            <option value="">All transmissions</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </label>
        <label>
          Year from
          <input max="32767" min="-32768" name="year_from" onChange={setField} step="1" type="number" value={formFilters.year_from} />
        </label>
        <label>
          Year to
          <input max="32767" min="-32768" name="year_to" onChange={setField} step="1" type="number" value={formFilters.year_to} />
        </label>
        <div className="analytics-filter-actions" style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button className="analytics-button is-primary" type="submit"><SlidersHorizontal aria-hidden="true" size={15} />Apply filters</button>
          <button className="analytics-button" onClick={clearFilters} type="button">Clear</button>
        </div>
        {filterError && <p className="analytics-filter-error" role="alert" style={{ gridColumn: '1 / -1' }}>{filterError}</p>}
      </form>

      {currentRecordState.status === 'loading'
        ? <LoadingState message="Loading filtered vehicle records…" />
        : currentRecordState.status === 'error'
          ? <ErrorState message={currentRecordState.message} title="Vehicle records unavailable" />
          : records.length === 0
            ? <EmptyState message="No records match the current filters, or no accepted records have been loaded." title="No vehicle records" />
            : (
              <>
                <div className="analytics-record-table-wrap">
                  <table className="analytics-record-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Vehicle</th>
                        <th>Year</th>
                        <th>Fuel</th>
                        <th>Transmission</th>
                        <th>Location</th>
                        <th>Odometer (km)</th>
                        <th>Raw Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => {
                        const rawPrice = record.combined_cars_selling_price_raw
                          ?? record.combined_cars_present_price_raw
                          ?? record.combined_cars2_price_raw
                          ?? record.combined_cars3_selling_price_raw
                        return (
                          <tr key={`${record.source_file_name}:${record.source_record_ordinal}`}>
                            <td><strong>{record.source_file_name || '—'}</strong><small>{record.source_name || 'Source group'}</small></td>
                            <td><strong>{record.brand || '—'}</strong><small>{record.full_model_name || record.model || 'Model unavailable'}</small></td>
                            <td>{formatNumber(record.vehicle_year)}</td>
                            <td>{record.fuel_type || '—'}</td>
                            <td>{record.transmission || '—'}</td>
                            <td><span style={{ color: '#70e1b4' }}>{record.city || '—'}</span></td>
                            <td>{formatNumber(record.odometer_km)}</td>
                            <td><strong style={{ color: '#62dce9' }}>{formatNumber(rawPrice)}</strong></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="analytics-pagination">
                  <span>{formatNumber(pagination?.total_records)} matching records · page {formatNumber(pagination?.page)} of {formatNumber(pagination?.total_pages)}</span>
                  <div>
                    <button className="analytics-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} type="button">Previous</button>
                    <button className="analytics-button" disabled={!pagination || page >= pagination.total_pages} onClick={() => setPage((value) => value + 1)} type="button">Next</button>
                  </div>
                </div>
              </>
            )}
    </section>
  )
}

function VehicleAnalyticsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [sourceFilter, setSourceFilter] = useState('')
  const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS)

  useEffect(() => {
    let active = true
    Promise.all([
      loadEndpoint(() => api.vehicleSummary()),
      loadEndpoint(() => api.vehicleBrands()),
      loadEndpoint(() => api.vehicleFuelTypes()),
      loadEndpoint(() => api.vehiclePriceAnalysis()),
    ]).then(([summary, brands, fuelTypes, prices]) => {
      if (active) setAnalytics({ summary, brands, fuelTypes, prices })
    })
    return () => { active = false }
  }, [refreshKey])

  const availableSources = useMemo(() => {
    const sourceNames = new Set()
    const sourceCounts = analytics.summary.data?.source_counts || []
    const brandRows = analytics.brands.data?.brands || []
    const fuelRows = analytics.fuelTypes.data?.fuel_types || []
    const priceRows = analytics.prices.data?.price_measures || []
    const rows = [...sourceCounts, ...brandRows, ...fuelRows, ...priceRows]
    rows.forEach((row) => {
      if (row.source_name) sourceNames.add(row.source_name)
    })
    return [...sourceNames].sort((a, b) => a.localeCompare(b))
  }, [analytics])

  const brandOptions = useMemo(() => [...new Set(
    (analytics.brands.data?.brands || [])
      .map((row) => row.brand)
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b)), [analytics.brands])

  const fuelOptions = useMemo(() => [...new Set(
    (analytics.fuelTypes.data?.fuel_types || [])
      .map((row) => row.fuel_type)
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b)), [analytics.fuelTypes])

  const brandRows = (analytics.brands.data?.brands || [])
    .filter((row) => !sourceFilter || row.source_name === sourceFilter)
    .map((row) => ({
      ...row,
      label: `${row.brand || 'Unspecified'} · ${row.source_file_name || row.source_name || 'source'}`,
    }))
    .sort((a, b) => Number(b.record_count) - Number(a.record_count))
    .slice(0, 10)

  const fuelRows = (analytics.fuelTypes.data?.fuel_types || [])
    .filter((row) => !sourceFilter || row.source_name === sourceFilter)
    .map((row) => ({
      ...row,
      label: `${row.fuel_type || 'Unspecified'} · ${row.source_file_name || row.source_name || 'source'}`,
    }))
    .sort((a, b) => Number(b.record_count) - Number(a.record_count))
    .slice(0, 8)

  const endpointStates = {
    summary: analytics.summary,
    brands: analytics.brands,
    fuelTypes: analytics.fuelTypes,
    prices: analytics.prices,
  }

  function refreshAnalytics() {
    setAnalytics(INITIAL_ANALYTICS)
    setRefreshKey((value) => value + 1)
  }

  return (
    <PageContainer className="vehicle-analytics-page">
      <SectionHeading
        action={(
          <button
            aria-label="Refresh analytics"
            className="analytics-button"
            disabled={Object.values(analytics).some((state) => state.status === 'loading')}
            onClick={refreshAnalytics}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={15} />
            Refresh
          </button>
        )}
        description="Explore verified marketplace records through the existing PostgreSQL Star Schema API."
        eyebrow="MARKETPLACE INSIGHTS"
        title="Vehicle Analytics Dashboard"
      />

      <AnalyticsBanner states={endpointStates} />

      <section className="analytics-overview-section">
        <div className="analytics-section-topline">
          <div>
            <span className="eyebrow">WAREHOUSE SNAPSHOT</span>
            <h3>Coverage at a glance</h3>
          </div>
          <span className="analytics-scope-note">Summary KPIs cover all available warehouse records.</span>
        </div>
        <MetricCards endpoint={analytics.summary} />
      </section>

      <div className="analytics-source-toolbar">
        <div>
          <span className="eyebrow">SOURCE-AWARE CHART FILTER</span>
          <p>Filters brand, fuel, and price breakdowns from their returned source-grouped rows. Summary KPIs remain warehouse-wide.</p>
        </div>
        <SourceFilter onChange={setSourceFilter} sources={availableSources} value={sourceFilter} />
      </div>

      <div className="analytics-chart-grid">
        <EndpointPanel
          description="Top source-scoped brand groups by accepted record count."
          endpoint={analytics.brands}
          title="Brand analysis"
        >
          {brandRows.length
            ? (
              <div className="analytics-chart">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={brandRows} layout="vertical" margin={{ top: 6, right: 16, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke="rgba(159, 181, 213, 0.1)" horizontal={false} />
                    <XAxis axisLine={false} tick={{ fill: '#8191a7', fontSize: 9 }} tickLine={false} type="number" />
                    <YAxis axisLine={false} dataKey="label" tick={{ fill: '#aab8ca', fontSize: 9 }} tickLine={false} type="category" width={148} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(98, 220, 233, 0.07)' }} />
                    <Bar dataKey="record_count" fill="#62dce9" maxBarSize={18} radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
            : <EmptyState message="No brand groups were returned for this source selection." title="No brand data" />}
        </EndpointPanel>

        <EndpointPanel
          description="Fuel categories stay scoped to their source groups; only the eight largest groups are plotted."
          endpoint={analytics.fuelTypes}
          title="Fuel-type distribution"
        >
          {fuelRows.length
            ? (
              <div className="analytics-chart analytics-fuel-chart">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      data={fuelRows}
                      dataKey="record_count"
                      innerRadius="52%"
                      nameKey="label"
                      outerRadius="78%"
                      paddingAngle={2}
                    >
                      {fuelRows.map((row, index) => (
                        <Cell fill={CHART_COLORS[index % CHART_COLORS.length]} key={`${row.source_name}:${row.fuel_type}`} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend formatter={(value) => <span className="analytics-legend-label">{value}</span>} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
            : <EmptyState message="No fuel categories were returned for this source selection." title="No fuel data" />}
        </EndpointPanel>
      </div>

      <EndpointPanel
        description="Minimum, average, and maximum values are visualized separately for each returned source measure."
        endpoint={analytics.prices}
        title="Source-specific price analysis"
      >
        {analytics.prices.data?.price_measures?.length
          ? <PriceAnalysis endpoint={analytics.prices} sourceFilter={sourceFilter} />
          : <EmptyState message="No non-null source-specific price measures were returned." title="No price measures" />}
      </EndpointPanel>

      <RecordBrowser
        brandOptions={brandOptions}
        brandsList={analytics.brands.data?.brands}
        fuelOptions={fuelOptions}
        fuelTypesList={analytics.fuelTypes.data?.fuel_types}
        refreshKey={refreshKey}
        summary={analytics.summary.data?.summary}
      />

      <footer className="analytics-footer-note">
        <Fuel aria-hidden="true" size={15} />
        <span>Marketplace listings are not confirmed sales. Price units and currencies remain unverified, so no combined price metric or resale-value prediction is shown.</span>
      </footer>
    </PageContainer>
  )
}

export default VehicleAnalyticsPage
