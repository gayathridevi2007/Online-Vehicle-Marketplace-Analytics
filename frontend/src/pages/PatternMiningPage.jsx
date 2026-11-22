import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import PageContainer from '../components/PageContainer.jsx'
import PatternGraphScene from '../components/PatternGraphScene.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import {
  STAR_SCHEMA_RELATIONSHIPS,
  STAR_SCHEMA_TABLES,
} from '../data/starSchema.js'

const FACT_TABLE = STAR_SCHEMA_TABLES.find((table) => table.kind === 'FACT')
const ATTRIBUTE_LABELS = {
  dim_source_dataset: 'Source dataset',
  dim_brand: 'Brand',
  dim_model: 'Model',
  dim_location: 'Location',
  dim_vehicle_year: 'Vehicle year',
  dim_fuel: 'Fuel type',
  dim_transmission: 'Transmission',
  dim_seller_type: 'Seller type',
}

function nodeLabel(table) {
  return table.kind === 'FACT' ? 'Source record' : ATTRIBUTE_LABELS[table.id]
}

function PatternMiningPage() {
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [resetToken, setResetToken] = useState(0)
  const selectedTable = STAR_SCHEMA_TABLES.find(
    (table) => table.id === selectedNodeId,
  )
  const connectedRelationships = STAR_SCHEMA_RELATIONSHIPS.filter(
    (relationship) => (
      relationship.factTable === selectedNodeId
      || relationship.dimensionTable === selectedNodeId
    ),
  )
  const descriptiveColumns = selectedTable?.columns.filter(
    (column) => !column.key && !column.references,
  ) || []

  function resetGraph() {
    setSelectedNodeId(null)
    setResetToken((token) => token + 1)
  }

  return (
    <PageContainer className="module-page pattern-mining-page">
      <SectionHeading
        action={(
          <button className="star-schema-reset" onClick={resetGraph} type="button">
            <RotateCcw aria-hidden="true" size={15} />
            Reset graph
          </button>
        )}
        description="Explore how supported warehouse attributes connect to an accepted source record."
        eyebrow="DATA MINING · GRAPH RELATIONSHIPS"
        title="Graph-Based Pattern Mining"
      />

      <div className="star-schema-notice" role="note">
        <strong>Schema relationship preview · no live vehicle records</strong>
        <span>
          Nodes and edges come from the approved Star Schema dimensions and
          foreign keys. No observed values, co-occurrences, or mined patterns
          are being presented.
        </span>
      </div>

      <section aria-label="Interactive vehicle attribute relationship graph" className="pattern-graph-panel">
        <div className="star-schema-panel-heading">
          <div>
            <span className="eyebrow">STAR SCHEMA · RELATIONSHIP GRAPH</span>
            <h3>Vehicle attributes and source-record links</h3>
          </div>
          <span className="star-schema-count">
            1 SOURCE RECORD · 8 ATTRIBUTE NODES · {STAR_SCHEMA_RELATIONSHIPS.length} FK EDGES
          </span>
        </div>
        <div aria-label="Graph legend" className="star-schema-legend">
          <span><i className="pattern-legend-fact" /> Accepted source record</span>
          <span><i className="pattern-legend-attribute" /> Attribute dimension</span>
          <span><i className="star-legend-link" /> FK edge points to the referencing record</span>
        </div>
        <PatternGraphScene
          key={resetToken}
          onSelect={setSelectedNodeId}
          selectedNodeId={selectedNodeId}
        />
        <p className="star-schema-canvas-hint">
          Drag to rotate · scroll to zoom · click a node to inspect its schema links
        </p>
      </section>

      <div className="pattern-graph-details-grid">
        <section aria-label="Selected graph node details" className="star-schema-detail-panel">
          <div className="star-schema-panel-heading star-schema-detail-heading">
            <div>
              <span className="eyebrow">NODE INSPECTOR</span>
              <h3>{selectedTable ? nodeLabel(selectedTable) : 'No node selected'}</h3>
            </div>
          </div>
          {selectedTable ? (
            <>
              <p className="star-schema-role">{selectedTable.role}</p>
              <div className="pattern-node-source">
                <span>Schema table</span>
                <code>{selectedTable.name}</code>
              </div>
              {descriptiveColumns.length > 0 && (
                <div className="star-schema-constraints pattern-node-attributes">
                  <strong>Supported attribute columns</strong>
                  {descriptiveColumns.map((column) => (
                    <code key={column.name}>{column.name}</code>
                  ))}
                </div>
              )}
              {connectedRelationships.length > 0 && (
                <div className="pattern-node-links">
                  <div className="star-schema-columns-heading">
                    <span>Connected foreign keys</span>
                    <span>{connectedRelationships.length} LINKS</span>
                  </div>
                  <ul className="star-schema-column-list">
                    {connectedRelationships.map((relationship) => {
                      const dimension = STAR_SCHEMA_TABLES.find(
                        (table) => table.id === relationship.dimensionTable,
                      )
                      return (
                        <li className="star-schema-column-row" key={relationship.id}>
                          <span className="star-schema-column-reference">
                            {FACT_TABLE.name}.{relationship.factColumn}
                            {' → '}
                            {dimension.name}.{relationship.dimensionColumn}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {selectedTable.kind === 'FACT' && (
                <p className="star-schema-relationship-note">
                  This is one accepted source row, not evidence of a completed
                  sale. The graph shows its schema links, not vehicle records.
                </p>
              )}
            </>
          ) : (
            <div className="star-schema-empty-selection">
              Select a node to inspect its supported attributes and actual
              Star Schema foreign-key links.
            </div>
          )}
        </section>

        <section aria-label="Graph-based pattern mining explanation" className="star-schema-education-panel">
          <span className="eyebrow">HOW GRAPH MINING HELPS</span>
          <h3>From connected records to patterns</h3>
          <p>
            Graph-based pattern mining represents entities as nodes and
            relationships as edges, then searches connected data for recurring
            structures or co-occurrences.
          </p>
          <ul>
            <li><strong>Current preview:</strong> node types are supported warehouse dimensions; each edge is an existing Star Schema FK to the fact.</li>
            <li><strong>Future analysis:</strong> verified record-level values could connect brands, models, fuel types, and observed locations to discover recurring combinations.</li>
            <li><strong>Interpretation:</strong> a repeated connection is a pattern to investigate, not proof of cause or resale value.</li>
          </ul>
          <p className="star-schema-caveat">
            The current API has no graph/co-occurrence endpoint and PostgreSQL
            records are not available here, so no value-level graph or mining
            result is fabricated.
          </p>
        </section>
      </div>
    </PageContainer>
  )
}

export default PatternMiningPage
