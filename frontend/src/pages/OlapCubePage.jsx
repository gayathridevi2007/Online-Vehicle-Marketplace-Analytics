import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import OlapCubeScene from '../components/OlapCubeScene.jsx'
import PageContainer from '../components/PageContainer.jsx'
import SectionHeading from '../components/SectionHeading.jsx'

const INITIAL_DIMENSIONS = [
  'Brand',
  'Fuel Type',
  'Manufacturing Year',
  'Model',
]
const INITIAL_OPERATION = {
  title: 'Preview cube',
  description: 'Rotate or select a section to explore the cube structure. No warehouse records are connected.',
}

function segmentOptions(resolution) {
  return Array.from({ length: resolution }, (_, index) => index + 1)
}

function OlapCubePage() {
  const [dimensionOrder, setDimensionOrder] = useState(INITIAL_DIMENSIONS)
  const [resolution, setResolution] = useState(3)
  const [operation, setOperation] = useState('preview')
  const [operationDescription, setOperationDescription] = useState(INITIAL_OPERATION)
  const [sliceDimension, setSliceDimension] = useState(INITIAL_DIMENSIONS[0])
  const [sliceSegment, setSliceSegment] = useState(1)
  const [diceFirstDimension, setDiceFirstDimension] = useState(INITIAL_DIMENSIONS[0])
  const [diceFirstSegment, setDiceFirstSegment] = useState(1)
  const [diceSecondDimension, setDiceSecondDimension] = useState(INITIAL_DIMENSIONS[1])
  const [diceSecondSegment, setDiceSecondSegment] = useState(2)
  const [operationView, setOperationView] = useState({ type: 'all' })
  const [selectedSection, setSelectedSection] = useState(null)
  const [pivotTurns, setPivotTurns] = useState(0)
  const [resetToken, setResetToken] = useState(0)
  const spatialDimensions = dimensionOrder.slice(0, 3)

  function showRollup() {
    setResolution(2)
    setSliceSegment(1)
    setDiceFirstSegment(1)
    setDiceSecondSegment(2)
    setOperationView({ type: 'all' })
    setSelectedSection(null)
    setOperation('roll-up')
    setOperationDescription({
      title: 'Roll-up · coarser structure',
      description: 'The preview reduces the cube divisions to suggest a higher-level view. No records are grouped or counted.',
    })
  }

  function showDrilldown() {
    setResolution(4)
    setOperationView({ type: 'all' })
    setSelectedSection(null)
    setOperation('drill-down')
    setOperationDescription({
      title: 'Drill-down · finer structure',
      description: 'The preview adds cube divisions to suggest a more detailed view. No source values or records are revealed.',
    })
  }

  function showSlice() {
    setOperationView({
      type: 'slice',
      dimension: sliceDimension,
      segment: sliceSegment,
    })
    setSelectedSection(null)
    setOperation('slice')
    setOperationDescription({
      title: `Slice · ${sliceDimension}`,
      description: `Showing one structural segment along ${sliceDimension}. It is a visual index, not a real dimension value.`,
    })
  }

  function showDice() {
    setOperationView({
      type: 'dice',
      first: { dimension: diceFirstDimension, segment: diceFirstSegment },
      second: { dimension: diceSecondDimension, segment: diceSecondSegment },
    })
    setSelectedSection(null)
    setOperation('dice')
    setOperationDescription({
      title: 'Dice · two structural filters',
      description: `Showing the intersection of ${diceFirstDimension} segment ${diceFirstSegment} and ${diceSecondDimension} segment ${diceSecondSegment}. These are preview indices, not data filters.`,
    })
  }

  function showPivot() {
    const nextOrder = [
      ...dimensionOrder.slice(1),
      dimensionOrder[0],
    ]
    setDimensionOrder(nextOrder)
    setSliceDimension(nextOrder[0])
    setDiceFirstDimension(nextOrder[0])
    setDiceSecondDimension(nextOrder[1])
    setOperationView({ type: 'all' })
    setSelectedSection(null)
    setPivotTurns((turns) => (turns + 1) % 4)
    setOperation('pivot')
    setOperationDescription({
      title: 'Pivot · dimensions rearranged',
      description: `The dimension labels have shifted: ${nextOrder.slice(0, 3).join(' · ')} are now the cube axes, with ${nextOrder[3]} shown as context. No data has been pivoted.`,
    })
  }

  function resetView() {
    setDimensionOrder(INITIAL_DIMENSIONS)
    setResolution(3)
    setOperation('preview')
    setOperationDescription(INITIAL_OPERATION)
    setSliceDimension(INITIAL_DIMENSIONS[0])
    setSliceSegment(1)
    setDiceFirstDimension(INITIAL_DIMENSIONS[0])
    setDiceFirstSegment(1)
    setDiceSecondDimension(INITIAL_DIMENSIONS[1])
    setDiceSecondSegment(2)
    setOperationView({ type: 'all' })
    setSelectedSection(null)
    setPivotTurns(0)
    setResetToken((token) => token + 1)
  }

  return (
    <PageContainer className="module-page olap-page">
      <SectionHeading
        description="Learn how OLAP operations rearrange dimensional views using a genuine interactive 3D cube."
        eyebrow="DIMENSIONAL EXPLORER · VISUALIZATION PREVIEW"
        title="Interactive 3D OLAP Cube"
        action={(
          <button className="olap-reset-button" onClick={resetView} type="button">
            <RotateCcw aria-hidden="true" size={15} />
            Reset view
          </button>
        )}
      />

      <div className="olap-preview-notice" role="note">
        <strong>Visualization preview — no live warehouse data</strong>
        <span>
          Cells are abstract structural segments. Operations change this view only;
          they do not query or aggregate vehicle records.
        </span>
      </div>

      <div className="olap-workspace">
        <section aria-label="Interactive OLAP cube" className="olap-visual-panel">
          <div className="olap-panel-heading">
            <div>
              <span className="eyebrow">3D CUBE VIEW</span>
              <h3>Explore the dimensional structure</h3>
            </div>
            <span className="preview-chip">PREVIEW</span>
          </div>
          <div className="cube-axis-legend" aria-label="Current dimension arrangement">
            {dimensionOrder.map((dimension, index) => (
              <span className="cube-axis-tag" key={dimension}>
                <i className={`axis-marker axis-marker-${index}`} />
                <span>{['X axis', 'Y axis', 'Z axis', 'Context'][index]}</span>
                <strong>{dimension}</strong>
              </span>
            ))}
          </div>
          <OlapCubeScene
            key={resetToken}
            dimensionOrder={dimensionOrder}
            operationView={operationView}
            onSelect={setSelectedSection}
            pivotTurns={pivotTurns}
            resolution={resolution}
            selectedSection={selectedSection}
          />
          <p className="cube-hint">Drag to rotate · scroll to zoom · click a section to inspect</p>
        </section>

        <aside aria-label="OLAP operation controls" className="olap-control-panel">
          <div className="olap-panel-heading">
            <div>
              <span className="eyebrow">OLAP OPERATIONS</span>
              <h3>Change the view</h3>
            </div>
          </div>

          <div className="olap-operation-grid">
            <button
              aria-pressed={operation === 'roll-up'}
              className={operation === 'roll-up' ? 'is-selected' : ''}
              onClick={showRollup}
              type="button"
            >
              Roll-up
              <small>Fewer divisions</small>
            </button>
            <button
              aria-pressed={operation === 'drill-down'}
              className={operation === 'drill-down' ? 'is-selected' : ''}
              onClick={showDrilldown}
              type="button"
            >
              Drill-down
              <small>More divisions</small>
            </button>
            <button
              aria-pressed={operation === 'slice'}
              className={operation === 'slice' ? 'is-selected' : ''}
              onClick={showSlice}
              type="button"
            >
              Slice
              <small>One dimension</small>
            </button>
            <button
              aria-pressed={operation === 'dice'}
              className={operation === 'dice' ? 'is-selected' : ''}
              onClick={showDice}
              type="button"
            >
              Dice
              <small>Two dimensions</small>
            </button>
            <button
              aria-pressed={operation === 'pivot'}
              className={operation === 'pivot' ? 'is-selected' : ''}
              onClick={showPivot}
              type="button"
            >
              Pivot
              <small>Rearrange axes</small>
            </button>
          </div>

          {operation === 'slice' && (
            <div className="olap-filter-controls">
              <label>
                Dimension
                <select
                  onChange={(event) => setSliceDimension(event.target.value)}
                  value={sliceDimension}
                >
                  {spatialDimensions.map((dimension) => (
                    <option key={dimension} value={dimension}>{dimension}</option>
                  ))}
                </select>
              </label>
              <label>
                Structural segment
                <select
                  onChange={(event) => setSliceSegment(Number(event.target.value))}
                  value={sliceSegment}
                >
                  {segmentOptions(resolution).map((segment) => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
              </label>
              <button className="olap-apply-button" onClick={showSlice} type="button">
                Apply slice
              </button>
            </div>
          )}

          {operation === 'dice' && (
            <div className="olap-filter-controls">
              <label>
                First dimension
                <select
                  onChange={(event) => {
                    const value = event.target.value
                    setDiceFirstDimension(value)
                    if (value === diceSecondDimension) {
                      setDiceSecondDimension(spatialDimensions.find((item) => item !== value))
                    }
                  }}
                  value={diceFirstDimension}
                >
                  {spatialDimensions.map((dimension) => (
                    <option key={dimension} value={dimension}>{dimension}</option>
                  ))}
                </select>
              </label>
              <label>
                Segment
                <select
                  onChange={(event) => setDiceFirstSegment(Number(event.target.value))}
                  value={diceFirstSegment}
                >
                  {segmentOptions(resolution).map((segment) => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
              </label>
              <label>
                Second dimension
                <select
                  onChange={(event) => setDiceSecondDimension(event.target.value)}
                  value={diceSecondDimension}
                >
                  {spatialDimensions
                    .filter((dimension) => dimension !== diceFirstDimension)
                    .map((dimension) => (
                      <option key={dimension} value={dimension}>{dimension}</option>
                    ))}
                </select>
              </label>
              <label>
                Segment
                <select
                  onChange={(event) => setDiceSecondSegment(Number(event.target.value))}
                  value={diceSecondSegment}
                >
                  {segmentOptions(resolution).map((segment) => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
              </label>
              <button className="olap-apply-button" onClick={showDice} type="button">
                Apply dice
              </button>
            </div>
          )}

          <div aria-live="polite" className="olap-operation-explanation">
            <span className="eyebrow">CURRENT VIEW</span>
            <h4>{operationDescription.title}</h4>
            <p>{operationDescription.description}</p>
          </div>

          <div aria-live="polite" className="olap-selection-card">
            <span className="eyebrow">SELECTED DIMENSIONS</span>
            {selectedSection ? (
              <>
                <strong>Cube section selected</strong>
                <dl>
                  {spatialDimensions.map((dimension, index) => (
                    <div key={dimension}>
                      <dt>{dimension}</dt>
                      <dd>Structural segment {selectedSection[index] + 1}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>{dimensionOrder[3]}</dt>
                    <dd>Context dimension</dd>
                  </div>
                </dl>
                <p>These labels describe the preview layout, not a vehicle or source value.</p>
              </>
            ) : (
              <p>Select any visible cube section to inspect its dimension arrangement.</p>
            )}
          </div>

          <p className="olap-education-note">
            In a data-backed OLAP cube, roll-up and drill-down change granularity,
            slice selects one dimension value, dice combines filters, and pivot
            rearranges dimensions. This preview demonstrates structure only.
          </p>
        </aside>
      </div>
    </PageContainer>
  )
}

export default OlapCubePage
