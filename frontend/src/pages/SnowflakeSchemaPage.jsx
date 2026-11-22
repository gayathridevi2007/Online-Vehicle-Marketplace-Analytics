import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import PageContainer from '../components/PageContainer.jsx'
import SchemaScene from '../components/SchemaScene.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import {
  SNOWFLAKE_SCHEMA_RELATIONSHIPS,
  SNOWFLAKE_SCHEMA_TABLES,
} from '../data/snowflakeSchema.js'

const FACT_TABLE = SNOWFLAKE_SCHEMA_TABLES.find((table) => table.kind === 'FACT')
const DIMENSION_COUNT = SNOWFLAKE_SCHEMA_TABLES.filter(
  (table) => table.kind === 'DIMENSION',
).length
const FOREIGN_KEY_COUNT = SNOWFLAKE_SCHEMA_RELATIONSHIPS.reduce(
  (count, relationship) => count + (relationship.constraintCount || 1),
  0,
)

function SnowflakeSchemaPage() {
  const [selectedTableId, setSelectedTableId] = useState(FACT_TABLE.id)
  const [selectedRelationshipId, setSelectedRelationshipId] = useState(null)
  const [columnView, setColumnView] = useState('compact')
  const [resetToken, setResetToken] = useState(0)
  const selectedTable = SNOWFLAKE_SCHEMA_TABLES.find(
    (table) => table.id === selectedTableId,
  )
  const connectedRelationships = SNOWFLAKE_SCHEMA_RELATIONSHIPS.filter(
    (relationship) => (
      relationship.fromTable === selectedTableId
      || relationship.toTable === selectedTableId
    ),
  )
  const selectedRelationship = SNOWFLAKE_SCHEMA_RELATIONSHIPS.find(
    (relationship) => relationship.id === selectedRelationshipId,
  )
  const visibleColumns = selectedTable
    ? selectedTable.columns.filter(
      (column) => columnView === 'columns' || column.key,
    )
    : []

  function resetView() {
    setSelectedTableId(null)
    setSelectedRelationshipId(null)
    setColumnView('compact')
    setResetToken((token) => token + 1)
  }

  function selectRelationship(relationshipId) {
    setSelectedRelationshipId((current) => (
      current === relationshipId ? null : relationshipId
    ))
  }

  function selectTable(tableId) {
    setSelectedTableId(tableId)
    setSelectedRelationshipId(null)
  }

  return (
    <PageContainer className="module-page star-schema-page snowflake-schema-page">
      <SectionHeading
        action={(
          <button className="star-schema-reset" onClick={resetView} type="button">
            <RotateCcw aria-hidden="true" size={15} />
            Reset view
          </button>
        )}
        description="Trace normalized dimensions and their foreign-key paths from the approved PostgreSQL Snowflake Schema."
        eyebrow="WAREHOUSE ARCHITECTURE · SCHEMA VISUALIZATION"
        title="Snowflake Schema (3D)"
      />

      <div className="star-schema-notice" role="note">
        <strong>Schema visualization · no live database connection</strong>
        <span>
          Tables and keys are shown from <code>snowflake_schema.sql</code>.
          The diagram contains no vehicle records or analytics.
        </span>
      </div>

      <section aria-label="Interactive Snowflake Schema diagram" className="star-schema-visual-panel">
        <div className="star-schema-panel-heading">
          <div>
            <span className="eyebrow">SNOWFLAKE SCHEMA · NORMALIZED</span>
            <h3>Fact, dimensions, and relationship paths</h3>
          </div>
          <span className="star-schema-count">
            1 FACT · {DIMENSION_COUNT} DIMENSIONS · {SNOWFLAKE_SCHEMA_RELATIONSHIPS.length} PATHS · {FOREIGN_KEY_COUNT} FK CONSTRAINTS
          </span>
        </div>
        <div aria-label="Diagram legend" className="star-schema-legend">
          <span><i className="star-legend-fact" /> Fact table</span>
          <span><i className="star-legend-dimension" /> Dimension table</span>
          <span><b>PK</b> Primary key</span>
          <span><b>FK</b> Foreign key</span>
          <span><i className="star-legend-link" /> Arrow points to the referencing table</span>
        </div>
        <SchemaScene
          key={resetToken}
          directed
          onSelect={selectTable}
          relationships={SNOWFLAKE_SCHEMA_RELATIONSHIPS}
          selectedRelationshipId={selectedRelationshipId}
          selectedTableId={selectedTableId}
          tables={SNOWFLAKE_SCHEMA_TABLES}
          worldHalfWidth={12.4}
        />
        <p className="star-schema-canvas-hint">
          Drag to rotate · scroll to zoom · click a table to inspect its columns
        </p>
      </section>

      <div className="star-schema-details-grid">
        <section aria-label="Selected table details" className="star-schema-detail-panel">
          <div className="star-schema-panel-heading star-schema-detail-heading">
            <div>
              <span className="eyebrow">TABLE INSPECTOR</span>
              <h3>{selectedTable?.name || 'No table selected'}</h3>
            </div>
            <div aria-label="Column display mode" className="star-schema-view-toggle">
              <button
                aria-pressed={columnView === 'compact'}
                className={columnView === 'compact' ? 'is-selected' : ''}
                onClick={() => setColumnView('compact')}
                type="button"
              >
                Compact
              </button>
              <button
                aria-pressed={columnView === 'columns'}
                className={columnView === 'columns' ? 'is-selected' : ''}
                onClick={() => setColumnView('columns')}
                type="button"
              >
                All columns
              </button>
            </div>
          </div>

          {selectedTable ? (
            <>
              <p className="star-schema-role">{selectedTable.role}</p>
              <div className="star-schema-columns-heading">
                <span>
                  {columnView === 'compact'
                    ? 'Key columns'
                    : `${selectedTable.columns.length} columns from the DDL`}
                </span>
                <span>{columnView === 'compact' ? 'KEYS' : 'TYPE · NULLABILITY'}</span>
              </div>
              <ul className="star-schema-column-list">
                {visibleColumns.map((column) => (
                  <li className="star-schema-column-row" key={column.name}>
                    <div className="star-schema-column-name">
                      <code>{column.name}</code>
                      {column.key && (
                        <span className={`star-key-badge is-${column.key.toLowerCase()}`}>
                          {column.key}
                        </span>
                      )}
                    </div>
                    {columnView === 'columns' && (
                      <span className="star-schema-column-type">
                        {column.type}
                        {' · '}
                        {column.nullable ? 'NULL' : 'NOT NULL'}
                        {column.identity ? ' · IDENTITY' : ''}
                        {column.constraint ? ` · ${column.constraint}` : ''}
                      </span>
                    )}
                    {column.references && (
                      <span className="star-schema-column-reference">
                        → {column.references}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {selectedTable.uniqueConstraints.length > 0 && (
                <div className="star-schema-constraints">
                  <strong>Unique constraints</strong>
                  {selectedTable.uniqueConstraints.map((constraint) => (
                    <code key={constraint}>{constraint}</code>
                  ))}
                </div>
              )}
              {selectedTable.foreignKeyConstraints?.length > 0 && (
                <div className="star-schema-constraints">
                  <strong>Composite foreign keys</strong>
                  {selectedTable.foreignKeyConstraints.map((constraint) => (
                    <code key={constraint}>{constraint}</code>
                  ))}
                </div>
              )}
              {connectedRelationships.length > 0 && (
                <div className="snowflake-relationship-section">
                  <div className="star-schema-columns-heading">
                    <span>Connected FK paths</span>
                    <span>SELECT TO HIGHLIGHT</span>
                  </div>
                  <ul className="snowflake-relationship-list">
                    {connectedRelationships.map((relationship) => (
                      <li key={relationship.id}>
                        <button
                          aria-pressed={selectedRelationshipId === relationship.id}
                          className={selectedRelationshipId === relationship.id
                            ? 'is-selected'
                            : ''}
                          onClick={() => selectRelationship(relationship.id)}
                          type="button"
                        >
                          <span>
                            {relationship.fromTable} → {relationship.toTable}
                          </span>
                          <code>{relationship.constraint}</code>
                          <small>
                            ({relationship.columns}) REFERENCES ({relationship.references})
                          </small>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedRelationship && (
                <p className="star-schema-relationship-note">
                  Highlighted path: <code>{selectedRelationship.constraint}</code>
                </p>
              )}
            </>
          ) : (
            <div className="star-schema-empty-selection">
              Select a table or reset the view to clear the selection and restore
              the camera.
            </div>
          )}
        </section>

        <section aria-label="Snowflake Schema learning notes" className="star-schema-education-panel">
          <span className="eyebrow">LEARN THE STRUCTURE</span>
          <h3>Why use a Snowflake Schema?</h3>
          <p>
            A Snowflake Schema normalizes selected dimensions into related
            tables, making the supported hierarchy explicit instead of repeating
            its descriptors on each model row.
          </p>
          <ul>
            <li><strong>Normalization:</strong> source-scoped brands and models are stored separately and linked by a composite key.</li>
            <li><strong>Compared with Star:</strong> Star keeps brand and model as flat dimensions; Snowflake adds their supported normalized path.</li>
            <li><strong>Relationship paths:</strong> a model can reach its brand and source; facts reach brand context through model.</li>
            <li><strong>Other dimensions:</strong> source dataset, location, year, fuel, transmission, and seller type remain flat where no hierarchy is supported.</li>
            <li><strong>Trade-off:</strong> normalization reduces repeated descriptive values but requires more joins than the Star Schema.</li>
          </ul>
          <p className="star-schema-caveat">
            City is not expanded into a state or region. Vehicle year is not a
            transaction date, and no brand is inferred when a source does not
            supply one.
          </p>
        </section>
      </div>
    </PageContainer>
  )
}

export default SnowflakeSchemaPage
