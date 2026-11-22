import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import PageContainer from '../components/PageContainer.jsx'
import SchemaScene from '../components/SchemaScene.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import {
  SNOWFLAKE_SCHEMA_RELATIONSHIPS,
  SNOWFLAKE_SCHEMA_TABLES,
} from '../data/snowflakeSchema.js'
import {
  STAR_SCHEMA_RELATIONSHIPS,
  STAR_SCHEMA_TABLES,
} from '../data/starSchema.js'

const VIEW_MODES = [
  { id: 'star', label: 'Star view' },
  { id: 'snowflake', label: 'Snowflake view' },
  { id: 'compare', label: 'Comparison view' },
]

const FOCUS_TABLES = STAR_SCHEMA_TABLES.map((table) => ({
  id: table.id,
  label: table.kind === 'FACT'
    ? 'Fact'
    : table.id.replace(/^dim_/, '').replaceAll('_', ' '),
}))

const STAR_EDGES = STAR_SCHEMA_RELATIONSHIPS.map((relationship) => ({
  ...relationship,
  fromTable: relationship.dimensionTable,
  toTable: relationship.factTable,
}))

const SCHEMAS = [
  {
    id: 'star',
    title: 'Star Schema',
    detail: 'Flat dimensions connect directly to the fact.',
    tables: STAR_SCHEMA_TABLES,
    relationships: STAR_EDGES,
    directed: false,
    worldHalfWidth: 10.6,
  },
  {
    id: 'snowflake',
    title: 'Snowflake Schema',
    detail: 'Brand and model follow normalized source-scoped paths.',
    tables: SNOWFLAKE_SCHEMA_TABLES,
    relationships: SNOWFLAKE_SCHEMA_RELATIONSHIPS,
    directed: true,
    worldHalfWidth: 12.4,
  },
]

const COMPARISON_ROWS = [
  {
    aspect: 'Structure',
    star: 'One central fact table with flat dimensions directly connected to it.',
    snowflake: 'Fact table plus normalized source, brand, and model relationship paths.',
  },
  {
    aspect: 'Dimension normalization',
    star: 'Brand and model are separate, flat dimensions.',
    snowflake: 'Brand and model are source-scoped and linked through composite keys.',
  },
  {
    aspect: 'Number of joins',
    star: 'Each requested dimension joins directly to the fact; count depends on the query.',
    snowflake: 'Brand context can require fact → model → brand; other dimensions stay direct.',
  },
  {
    aspect: 'Query complexity',
    star: 'Fewer relationship paths for common dimensional queries.',
    snowflake: 'More joins and composite-key conditions for normalized paths.',
  },
  {
    aspect: 'Storage considerations',
    star: 'Flat dimensions may repeat descriptive values across related entries.',
    snowflake: 'May reduce repeated brand descriptors, with additional table and key overhead; sizes are not benchmarked.',
  },
  {
    aspect: 'Ease of understanding',
    star: 'A straightforward fact-and-dimensions layout.',
    snowflake: 'More relationship paths to learn, but normalization is explicit.',
  },
]

function StarVsSnowflakePage() {
  const [viewMode, setViewMode] = useState('compare')
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [resetToken, setResetToken] = useState(0)
  const visibleSchemas = viewMode === 'compare'
    ? SCHEMAS
    : SCHEMAS.filter((schema) => schema.id === viewMode)

  function resetView() {
    setSelectedTableId(null)
    setResetToken((token) => token + 1)
  }

  return (
    <PageContainer className="module-page schema-comparison-page">
      <SectionHeading
        action={(
          <button className="star-schema-reset" onClick={resetView} type="button">
            <RotateCcw aria-hidden="true" size={15} />
            Reset views
          </button>
        )}
        description="Compare the approved Star and Snowflake structures using the same warehouse tables and relationships."
        eyebrow="WAREHOUSE ARCHITECTURE · SCHEMA COMPARISON"
        title="Star vs Snowflake"
      />

      <div className="star-schema-notice" role="note">
        <strong>Schema comparison · no live database connection</strong>
        <span>
          Both diagrams use approved schema metadata. The comparison describes
          structure only; it contains no vehicle records or performance benchmarks.
        </span>
      </div>

      <section aria-label="Schema view controls" className="schema-comparison-controls">
        <div>
          <span className="eyebrow">SCHEMA VIEW</span>
          <div className="schema-view-toggle" role="group" aria-label="Choose schema view">
            {VIEW_MODES.map((mode) => (
              <button
                aria-pressed={viewMode === mode.id}
                className={viewMode === mode.id ? 'is-selected' : ''}
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                type="button"
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="eyebrow">HIGHLIGHT RELATED TABLES</span>
          <div className="schema-focus-controls" role="group" aria-label="Highlight corresponding table relationships">
            <button
              aria-pressed={selectedTableId === null}
              className={selectedTableId === null ? 'is-selected' : ''}
              onClick={() => setSelectedTableId(null)}
              type="button"
            >
              All
            </button>
            {FOCUS_TABLES.map((table) => (
              <button
                aria-pressed={selectedTableId === table.id}
                className={selectedTableId === table.id ? 'is-selected' : ''}
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                type="button"
              >
                {table.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Interactive Star and Snowflake schema diagrams"
        className={`schema-comparison-scenes ${viewMode === 'compare' ? 'is-comparison' : 'is-single'}`}
      >
        {visibleSchemas.map((schema) => (
          <article className="schema-comparison-card" key={schema.id}>
            <div className="schema-comparison-card-heading">
              <div>
                <span className="eyebrow">
                  {schema.id === 'star' ? 'STAR · FLAT DIMENSIONS' : 'SNOWFLAKE · NORMALIZED PATHS'}
                </span>
                <h3>{schema.title}</h3>
                <p>{schema.detail}</p>
              </div>
              <span className="schema-table-count">
                {schema.tables.length} TABLES
              </span>
            </div>
            <SchemaScene
              directed={schema.directed}
              key={`${schema.id}-${resetToken}`}
              onSelect={setSelectedTableId}
              relationships={schema.relationships}
              selectedTableId={selectedTableId}
              tables={schema.tables}
              worldHalfWidth={schema.worldHalfWidth}
            />
            <p className="star-schema-canvas-hint">
              Drag to rotate · scroll to zoom · click a table to highlight its paths
            </p>
          </article>
        ))}
      </section>

      <section aria-label="Star and Snowflake schema comparison table" className="schema-comparison-table-panel">
        <div className="star-schema-panel-heading">
          <div>
            <span className="eyebrow">STRUCTURAL TRADE-OFFS</span>
            <h3>How the schemas differ</h3>
          </div>
          <span className="schema-comparison-caveat">No runtime or storage benchmarks</span>
        </div>
        <div className="schema-comparison-table-wrap">
          <table className="schema-comparison-table">
            <thead>
              <tr>
                <th scope="col">Aspect</th>
                <th scope="col">Star Schema</th>
                <th scope="col">Snowflake Schema</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.aspect}>
                  <th scope="row">{row.aspect}</th>
                  <td>{row.star}</td>
                  <td>{row.snowflake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="When to use each schema" className="schema-use-cases">
        <article className="star-schema-education-panel">
          <span className="eyebrow">WHEN A STAR SCHEMA FITS</span>
          <h3>Prefer direct dimensional paths</h3>
          <p>
            Use the Star design when analysts benefit from a simple fact-to-dimension
            layout and the source-specific flat dimensions meet the modeling needs.
          </p>
        </article>
        <article className="star-schema-education-panel">
          <span className="eyebrow">WHEN A SNOWFLAKE SCHEMA FITS</span>
          <h3>Make supported normalization explicit</h3>
          <p>
            Use the Snowflake design when source-scoped brand and model relationships
            should be represented and constrained separately, accepting the extra joins.
          </p>
        </article>
      </section>
    </PageContainer>
  )
}

export default StarVsSnowflakePage
