import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Box,
  Database,
  GitBranch,
  Key,
  Layers,
  Scale,
  ShieldCheck,
  Star,
  Table2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/PageContainer.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { api } from '../services/api.js'

const ARCHITECTURE_METRICS = [
  {
    label: 'Central fact table',
    value: 'FACT_VEHICLE_MARKETPLACE',
    detail: 'Grain: One accepted source vehicle record',
    icon: Table2,
  },
  {
    label: 'Loaded fact records',
    value: '17,437',
    detail: 'Accepted rows loaded into Star schema',
    icon: Layers,
  },
  {
    label: 'Dimension tables',
    value: '8 Dimensions',
    detail: 'Surrogate-keyed with unique business constraints',
    icon: Box,
  },
  {
    label: 'Referential integrity',
    value: '8 Star / 11 Snowflake',
    detail: '0 orphan keys across verified records',
    icon: Key,
  },
  {
    label: 'Schema paradigm',
    value: 'Star & Snowflake',
    detail: 'Star loaded; Snowflake DDL defined',
    icon: GitBranch,
  },
]

const DIMENSIONS = [
  {
    name: 'dim_source_dataset',
    pk: 'source_dataset_key (BIGINT)',
    attributes: 'container_csv_name, source_name_value',
    constraint: 'UNIQUE (container_csv_name, source_name_value)',
    source: 'Top-level container CSV filename and observed Source.Name',
    role: 'Required fact FK (NOT NULL); identifies dataset origin',
  },
  {
    name: 'dim_brand',
    pk: 'brand_key (BIGINT)',
    attributes: 'source_dataset_name, brand_name_raw',
    constraint: 'UNIQUE (source_dataset_name, brand_name_raw)',
    source: 'Dataset.csv and cardekho_dataset.csv groups',
    role: 'Nullable fact FK in Star; normalized parent in Snowflake',
  },
  {
    name: 'dim_model',
    pk: 'model_key (BIGINT)',
    attributes: 'source_dataset_name, source_model_field, model_name_raw, full_model_name_raw',
    constraint: 'Source-scoped raw model text',
    source: 'Car_Name, model_name/full_model_name, car_name/model',
    role: 'Nullable fact FK; references dim_brand in Snowflake',
  },
  {
    name: 'dim_location',
    pk: 'location_key (BIGINT)',
    attributes: 'source_dataset_name, city_name_raw',
    constraint: 'UNIQUE (source_dataset_name, city_name_raw)',
    source: 'Observed city in Dataset.csv only',
    role: 'Nullable fact FK; flat city dimension (no state/region inferred)',
  },
  {
    name: 'dim_vehicle_year',
    pk: 'vehicle_year_key (BIGINT)',
    attributes: 'vehicle_year (SMALLINT)',
    constraint: 'UNIQUE (vehicle_year)',
    source: 'Year in car data.csv and year in Dataset.csv',
    role: 'Nullable fact FK; vehicle model year (not transaction date)',
  },
  {
    name: 'dim_fuel',
    pk: 'fuel_key (BIGINT)',
    attributes: 'source_dataset_name, fuel_type_raw',
    constraint: 'UNIQUE (source_dataset_name, fuel_type_raw)',
    source: 'Fuel_Type / fuel_type in recoverable source groups',
    role: 'Nullable fact FK; petrol, diesel, CNG, electric, LPG',
  },
  {
    name: 'dim_transmission',
    pk: 'transmission_key (BIGINT)',
    attributes: 'source_dataset_name, transmission_type_raw',
    constraint: 'UNIQUE (source_dataset_name, transmission_type_raw)',
    source: 'Transmission in car data.csv and cardekho_dataset.csv',
    role: 'Nullable fact FK; manual and automatic gearboxes',
  },
  {
    name: 'dim_seller_type',
    pk: 'seller_type_key (BIGINT)',
    attributes: 'source_dataset_name, seller_type_raw',
    constraint: 'UNIQUE (source_dataset_name, seller_type_raw)',
    source: 'Seller_Type in car data.csv and cardekho_dataset.csv',
    role: 'Nullable fact FK; individual, dealer, trustmark dealer',
  },
]

const EXPLORATION_MODULES = [
  {
    title: 'Star Schema (3D)',
    path: '/star-schema',
    icon: Star,
    description: 'Explore the centralized fact table and 8 radial dimensions in an interactive 3D scene.',
    status: 'Schema preview ready',
  },
  {
    title: 'Snowflake Schema (3D)',
    path: '/snowflake-schema',
    icon: GitBranch,
    description: 'Examine normalized dimension hierarchies and composite model-to-brand relationships in 3D.',
    status: 'Schema preview ready',
  },
  {
    title: 'Star vs. Snowflake Comparison',
    path: '/comparison',
    icon: Scale,
    description: 'Compare both dimensional architectures side-by-side across normalization, joins, and storage.',
    status: 'Comparison ready',
  },
  {
    title: 'Vehicle Analytics Dashboard',
    path: '/vehicle-analytics',
    icon: Database,
    description: 'Query live aggregated metrics, fuel distributions, and filterable warehouse records.',
    status: 'Warehouse connected',
  },
]

function WarehouseArchitecturePage() {
  const [dbStatus, setDbStatus] = useState('checking')
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let active = true
    api.vehicleSummary()
      .then((data) => {
        if (!active) return
        setDbStatus('connected')
        setSummary(data?.summary)
      })
      .catch(() => {
        if (!active) return
        setDbStatus('unavailable')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <PageContainer className="warehouse-architecture-page">
      <SectionHeading
        description="Dimensional design, grain definition, surrogate key structure, and referential constraints in PostgreSQL."
        eyebrow="DATA WAREHOUSE ARCHITECTURE"
        title="PostgreSQL Warehouse Design"
      />

      <div
        className={`analytics-status ${
          dbStatus === 'connected' ? 'is-connected' : 'is-unavailable'
        }`}
        role="status"
        style={{ marginBottom: '20px' }}
      >
        <Database aria-hidden="true" size={18} />
        <div>
          <strong>
            {dbStatus === 'connected'
              ? 'PostgreSQL Star Schema Active'
              : 'PostgreSQL Connection Offline / Sandboxed'}
          </strong>
          <span>
            {dbStatus === 'connected'
              ? `Connected to database "vehicle_analytics". Fact table contains ${Number(
                  summary?.total_records ?? 17437,
                ).toLocaleString()} rows across 8 dimensions.`
              : 'Displaying approved database schema metadata from database/schema/ and docs/DATABASE_DESIGN.md.'}
          </span>
        </div>
      </div>

      <section className="analytics-overview-section" style={{ marginBottom: '24px' }}>
        <div className="analytics-section-topline">
          <div>
            <span className="eyebrow">WAREHOUSE SPECIFICATIONS</span>
            <h3>Architecture At A Glance</h3>
          </div>
          <p className="analytics-scope-note">
            Implemented in PostgreSQL 17 with separate star and snowflake schemas.
          </p>
        </div>
        <div className="analytics-kpi-grid">
          {ARCHITECTURE_METRICS.map((kpi) => {
            const Icon = kpi.icon
            return (
              <article className="analytics-kpi-card" key={kpi.label}>
                <div className="analytics-kpi-icon">
                  <Icon aria-hidden="true" size={18} />
                </div>
                <span>{kpi.label}</span>
                <strong style={{ fontSize: kpi.value.length > 15 ? '13px' : undefined }}>{kpi.value}</strong>
                <small>{kpi.detail}</small>
              </article>
            )
          })}
        </div>
      </section>

      <section className="analytics-panel" style={{ marginBottom: '24px' }}>
        <header className="analytics-panel-heading">
          <div>
            <span className="eyebrow">FACT TABLE DEFINITION</span>
            <h3>Grain, Lineage & Unconverted Measures</h3>
            <p>
              The central fact table captures atomic marketplace listings with strict traceability to original raw rows.
            </p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <div
            style={{
              background: 'rgba(21, 32, 49, 0.7)',
              border: '1px solid rgba(151, 175, 207, 0.12)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Layers size={16} style={{ color: '#62dce9' }} />
              <h4 style={{ margin: 0, fontSize: '13px', color: '#e2ebf5' }}>Fact Grain & Integrity</h4>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#9aa9bd', lineHeight: 1.55 }}>
              <strong>One accepted source vehicle record from one source dataset.</strong> It does not assert a completed transaction, unique vehicle VIN, or dated sale. Repeated listings remain separate until duplicate policies are established.
            </p>
            <div style={{ fontSize: '10px', color: '#70a9ff', background: 'rgba(11, 18, 30, 0.6)', padding: '8px 10px', borderRadius: '5px' }}>
              <strong>Unique Natural Constraint:</strong> UNIQUE (source_file_name, source_record_ordinal)
            </div>
          </div>

          <div
            style={{
              background: 'rgba(21, 32, 49, 0.7)',
              border: '1px solid rgba(151, 175, 207, 0.12)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Key size={16} style={{ color: '#70e1b4' }} />
              <h4 style={{ margin: 0, fontSize: '13px', color: '#e2ebf5' }}>Lineage Attributes</h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#9aa9bd', lineHeight: 1.6 }}>
              <li><code>source_file_name</code>: Name of container CSV (combined_cars*.csv)</li>
              <li><code>source_record_ordinal</code>: 1-based original row position</li>
              <li><code>source_row_identifier_field</code>: Raw source ID label</li>
              <li><code>source_row_identifier_raw</code>: Original source ID value</li>
            </ul>
          </div>

          <div
            style={{
              background: 'rgba(21, 32, 49, 0.7)',
              border: '1px solid rgba(151, 175, 207, 0.12)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={16} style={{ color: '#f6a96b' }} />
              <h4 style={{ margin: 0, fontSize: '13px', color: '#e2ebf5' }}>Source-Specific Measures</h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#9aa9bd', lineHeight: 1.6 }}>
              <li>4 distinct price columns preserved without currency conversion</li>
              <li><code>odometer_km</code>: Stored only when explicitly in kilometers</li>
              <li><code>combined_cars2_car_age_raw</code> & <code>vehicle_age_raw</code></li>
              <li>Technical measures: mileage, engine, max_power, seats</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="analytics-panel" style={{ marginBottom: '24px' }}>
        <header className="analytics-panel-heading">
          <div>
            <span className="eyebrow">DIMENSIONAL METADATA</span>
            <h3>The 8 Dimension Tables</h3>
            <p>Generated surrogate keys, natural business keys, and source coverage.</p>
          </div>
        </header>
        <div className="schema-comparison-table-wrap" style={{ marginTop: '14px' }}>
          <table className="schema-comparison-table">
            <thead>
              <tr>
                <th>Dimension Table</th>
                <th>Surrogate Primary Key</th>
                <th>Descriptive Attributes</th>
                <th>Business Key Constraint</th>
                <th>Source Coverage & Role</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((dim) => (
                <tr key={dim.name}>
                  <th style={{ color: '#e2ebf5' }}>
                    <strong>{dim.name}</strong>
                  </th>
                  <td style={{ fontFamily: 'monospace', fontSize: '10px', color: '#62dce9' }}>
                    {dim.pk}
                  </td>
                  <td style={{ fontSize: '10px' }}>{dim.attributes}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '9px', color: '#70a9ff' }}>
                    {dim.constraint}
                  </td>
                  <td>
                    <span>{dim.source}</span>
                    <br />
                    <small style={{ color: '#70e1b4' }}>{dim.role}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="analytics-panel">
        <header className="analytics-panel-heading">
          <div>
            <span className="eyebrow">INTERACTIVE EXPLORATION</span>
            <h3>Visual Schemas & Analytics Modules</h3>
            <p>Access the 3D schema visualizers, comparative analysis, and live analytics dashboard.</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '16px' }}>
          {EXPLORATION_MODULES.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                className="module-card"
                key={mod.path}
                style={{ textDecoration: 'none' }}
                to={mod.path}
              >
                <div className="module-card-top">
                  <span className="module-icon">
                    <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="module-arrow" size={17} />
                </div>
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
                <span className="module-status">{mod.status}</span>
              </Link>
            )
          })}
        </div>
      </section>
    </PageContainer>
  )
}

export default WarehouseArchitecturePage
