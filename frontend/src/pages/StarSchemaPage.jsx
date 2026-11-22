import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import StarSchemaScene from '../components/StarSchemaScene.jsx'
import PageContainer from '../components/PageContainer.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import {
  STAR_SCHEMA_RELATIONSHIPS,
  STAR_SCHEMA_TABLES,
} from '../data/starSchema.js'

const FACT_TABLE = STAR_SCHEMA_TABLES.find((table) => table.kind === 'FACT')
const DIMENSION_COUNT = STAR_SCHEMA_TABLES.filter(
  (table) => table.kind === 'DIMENSION',
).length

function StarSchemaPage() {
  const [selectedTableId, setSelectedTableId] = useState(FACT_TABLE.id)
  const [columnView, setColumnView] = useState('compact')
  const [resetToken, setResetToken] = useState(0)
  const selectedTable = STAR_SCHEMA_TABLES.find(
    (table) => table.id === selectedTableId,
  )
  const selectedRelationship = STAR_SCHEMA_RELATIONSHIPS.find(
    (relationship) => relationship.dimensionTable === selectedTableId,
  )
  const visibleColumns = selectedTable
    ? selectedTable.columns.filter(
      (column) => columnView === 'columns' || column.key,
    )
    : []

  function resetView() {
    setSelectedTableId(null)
    setColumnView('compact')
    setResetToken((token) => token + 1)
  }

  return (
    <PageContainer className="module-page star-schema-page">
      <SectionHeading
        action={(
          <button className="star-schema-reset" onClick={resetView} type="button">
            <RotateCcw aria-hidden="true" size={15} />
            Reset view
          </button>
        )}
        description="Explore the approved PostgreSQL Star Schema: one central fact table connected directly to its dimensions."
        eyebrow="WAREHOUSE ARCHITECTURE · SCHEMA VISUALIZATION"
        title="Star Schema (3D)"
      />

      <div className="star-schema-notice" role="note">
        <strong>Schema visualization · no live database connection</strong>
        <span>
          Table structures and keys are shown from <code>star_schema.sql</code>.
          The diagram contains no vehicle records or analytics.
        </span>
      </div>

      <section aria-label="Interactive Star Schema diagram" className="star-schema-visual-panel">
        <div className="star-schema-panel-heading">
          <div>
            <span className="eyebrow">STAR SCHEMA · STAR</span>
            <h3>Fact and dimension relationships</h3>
          </div>
          <span className="star-schema-count">
            1 FACT · {DIMENSION_COUNT} DIMENSIONS · {STAR_SCHEMA_RELATIONSHIPS.length} FK LINKS
          </span>
        </div>
        <div aria-label="Diagram legend" className="star-schema-legend">
          <span><i className="star-legend-fact" /> Fact table</span>
          <span><i className="star-legend-dimension" /> Dimension table</span>
          <span><b>PK</b> Primary key</span>
          <span><b>FK</b> Foreign key</span>
          <span><i className="star-legend-link" /> Direct FK relationship</span>
        </div>
        <StarSchemaScene
          key={resetToken}
          onSelect={setSelectedTableId}
          selectedTableId={selectedTableId}
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
              {selectedTable.kind === 'FACT' ? (
                <p className="star-schema-relationship-note">
                  Eight direct foreign keys: <code>source_dataset_key</code> is
                  required; the other seven dimension keys are nullable.
                </p>
              ) : selectedRelationship ? (
                <p className="star-schema-relationship-note">
                  Relationship:{' '}
                  <code>
                    {FACT_TABLE.name}.{selectedRelationship.factColumn}
                    {' → '}
                    {selectedTable.name}.{selectedRelationship.dimensionColumn}
                  </code>
                  {selectedRelationship.nullable ? ' · nullable FK' : ' · required FK'}
                </p>
              ) : null}
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
            </>
          ) : (
            <div className="star-schema-empty-selection">
              Select a table in the diagram to inspect its columns and keys.
              Reset clears the selection and returns the camera to its starting view.
            </div>
          )}
        </section>

        <section aria-label="Star Schema learning notes" className="star-schema-education-panel">
          <span className="eyebrow">LEARN THE STRUCTURE</span>
          <h3>Why use a Star Schema?</h3>
          <p>
            A Star Schema places measurable source records in a central fact
            table and descriptive context in surrounding dimension tables.
          </p>
          <ul>
            <li><strong>Central fact:</strong> records one accepted marketplace source row; it does not claim a completed sale.</li>
            <li><strong>Dimensions:</strong> describe source, brand, model, observed location, vehicle year, fuel, transmission, and seller type.</li>
            <li><strong>Foreign keys:</strong> connect each fact row directly to the applicable dimension primary key.</li>
            <li><strong>OLAP:</strong> direct joins make it practical to group and filter fact records by their available descriptive dimensions.</li>
          </ul>
          <p className="star-schema-caveat">
            Vehicle year is not a transaction date. Brand, model, and location
            dimensions remain source-scoped; no unsupported hierarchy is shown.
          </p>
        </section>
      </div>
    </PageContainer>
  )
}

export default StarSchemaPage
