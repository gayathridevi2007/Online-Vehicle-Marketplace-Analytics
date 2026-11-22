import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import { Quaternion, Vector3 } from 'three'

const CAMERA_DIRECTION = new Vector3(0.12, 0.68, 0.73).normalize()

function RelationshipLine({
  directed,
  relationship,
  selectedRelationshipId,
  selectedTableId,
  tablesById,
}) {
  const from = tablesById[relationship.fromTable]
  const to = tablesById[relationship.toTable]
  const highlighted = selectedRelationshipId === relationship.id
    || selectedTableId === relationship.fromTable
    || selectedTableId === relationship.toTable
  const start = new Vector3(from.position[0], 0.3, from.position[2])
  const end = new Vector3(to.position[0], 0.3, to.position[2])
  const direction = end.clone().sub(start).normalize()
  const arrowPosition = end.clone().addScaledVector(direction, -1.25)
  const arrowRotation = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction,
  )

  return (
    <>
      <Line
        color={highlighted ? '#70e7ef' : '#35536b'}
        lineWidth={highlighted ? 3 : 1.5}
        opacity={highlighted ? 0.95 : 0.54}
        points={[start, end]}
        transparent
      />
      {directed && (
        <mesh
          position={arrowPosition}
          quaternion={arrowRotation}
        >
          <coneGeometry args={[0.14, 0.38, 8]} />
          <meshStandardMaterial
            color={highlighted ? '#70e7ef' : '#7189a7'}
            emissive={highlighted ? '#39c8d4' : '#29374a'}
            emissiveIntensity={highlighted ? 0.35 : 0.12}
          />
        </mesh>
      )}
    </>
  )
}

function TableNode({ table, selected, onSelect }) {
  const meshRef = useRef(null)
  const isFact = table.kind === 'FACT'
  const nodeSize = isFact ? [2.8, 0.9, 1.9] : [1.8, 0.55, 1.25]

  useFrame((_, delta) => {
    if (meshRef.current) {
      const target = selected ? 1.07 : 1
      const amount = 1 - Math.exp(-8 * delta)
      const next = meshRef.current.scale.x + (target - meshRef.current.scale.x) * amount
      meshRef.current.scale.setScalar(next)
    }
  })

  function selectTable(event) {
    event.stopPropagation()
    onSelect(table.id)
  }

  return (
    <mesh
      ref={meshRef}
      position={table.position}
      onClick={selectTable}
    >
      <boxGeometry args={nodeSize} />
      <meshStandardMaterial
        color={selected ? '#2b8495' : isFact ? '#184a68' : '#202448'}
        emissive={selected ? '#39c8d4' : isFact ? '#1b86a0' : '#5548a1'}
        emissiveIntensity={selected ? 0.42 : 0.17}
        metalness={0.28}
        roughness={0.34}
      />
    </mesh>
  )
}

function ProjectedTableLabels({ labelRefs, tables }) {
  const { camera, size } = useThree()
  const labels = useRef(
    tables.map((table) => ({
      id: table.id,
      position: new Vector3(
        table.position[0],
        table.position[1] + (table.kind === 'FACT' ? 1.15 : 0.9),
        table.position[2],
      ),
    })),
  )

  useFrame(() => {
    const stackLabels = size.width < 720
    labels.current.forEach(({ id, position }, index) => {
      const element = labelRefs.current[id]
      if (!element) return
      const projected = position.clone().project(camera)
      const visible = projected.z >= -1 && projected.z <= 1
      const projectedX = (projected.x * 0.5 + 0.5) * size.width
      const left = stackLabels
        ? Math.min(
          size.width - element.offsetWidth / 2 - 4,
          Math.max(element.offsetWidth / 2 + 4, projectedX),
        )
        : projectedX
      const top = stackLabels
        ? (size.height / labels.current.length) * (index + 0.5)
        : (-projected.y * 0.5 + 0.5) * size.height
      element.style.left = `${left}px`
      element.style.top = `${top}px`
      element.style.visibility = visible ? 'visible' : 'hidden'
    })
  })

  return null
}

function SceneContents({
  directed,
  labelRefs,
  onSelect,
  relationships,
  selectedRelationshipId,
  selectedTableId,
  tables,
  worldHalfWidth,
}) {
  const controlsRef = useRef(null)
  const { camera, size } = useThree()
  const tablesById = Object.fromEntries(tables.map((table) => [table.id, table]))

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1)
    const halfWidthDistance = worldHalfWidth
      / (Math.tan((camera.fov * Math.PI) / 360) * aspect)
    const distance = Math.max(18, halfWidthDistance)
    camera.position.copy(CAMERA_DIRECTION).multiplyScalar(distance)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update()
    controlsRef.current?.saveState()
  }, [camera, size.height, size.width, worldHalfWidth])

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[6, 11, 5]} intensity={2.2} />
      <pointLight color="#55d9e8" position={[-5, 5, -5]} intensity={38} distance={20} />
      <gridHelper
        args={[28, 36, '#28465e', '#14273a']}
        position={[0, -0.3, 0]}
      />
      {relationships.map((relationship) => (
        <RelationshipLine
          directed={directed}
          key={relationship.id}
          relationship={relationship}
          selectedRelationshipId={selectedRelationshipId}
          selectedTableId={selectedTableId}
          tablesById={tablesById}
        />
      ))}
      {tables.map((table) => (
        <TableNode
          key={table.id}
          onSelect={onSelect}
          selected={selectedTableId === table.id}
          table={table}
        />
      ))}
      <ProjectedTableLabels labelRefs={labelRefs} tables={tables} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        dampingFactor={0.08}
        enableDamping
        enablePan
        maxDistance={70}
        minDistance={12}
      />
    </>
  )
}

function SchemaScene({
  directed = false,
  onSelect,
  relationships,
  selectedRelationshipId = null,
  selectedTableId,
  tables,
  worldHalfWidth = 10.6,
}) {
  const labelRefs = useRef({})

  return (
    <div className="star-schema-canvas-stage">
      <div
        aria-label="Interactive three-dimensional schema diagram"
        className="star-schema-canvas"
      >
        <Canvas
          camera={{ fov: 42, position: [2, 14, 18] }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
        >
          <SceneContents
            directed={directed}
            labelRefs={labelRefs}
            onSelect={onSelect}
            relationships={relationships}
            selectedRelationshipId={selectedRelationshipId}
            selectedTableId={selectedTableId}
            tables={tables}
            worldHalfWidth={worldHalfWidth}
          />
        </Canvas>
      </div>
      <div className="star-schema-label-layer">
        {tables.map((table) => (
          <button
            aria-pressed={selectedTableId === table.id}
            aria-label={`Select table ${table.name}`}
            className={[
              'star-node-label',
              table.kind === 'FACT' ? 'is-fact' : 'is-dimension',
              selectedTableId === table.id ? 'is-selected' : '',
            ].filter(Boolean).join(' ')}
            key={table.id}
            onClick={() => onSelect(table.id)}
            ref={(element) => {
              labelRefs.current[table.id] = element
            }}
            type="button"
          >
            <span>{table.kind}</span>
            <strong>{table.name}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SchemaScene
