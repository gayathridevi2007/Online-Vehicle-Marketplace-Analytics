import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import { Quaternion, Vector3 } from 'three'
import {
  STAR_SCHEMA_RELATIONSHIPS,
  STAR_SCHEMA_TABLES,
} from '../data/starSchema.js'

const FACT_TABLE = STAR_SCHEMA_TABLES.find((table) => table.kind === 'FACT')
const TABLES_BY_ID = Object.fromEntries(
  STAR_SCHEMA_TABLES.map((table) => [table.id, table]),
)
const NODE_LABELS = {
  fact_vehicle_marketplace: 'Source record',
  dim_source_dataset: 'Source dataset',
  dim_brand: 'Brand',
  dim_model: 'Model',
  dim_location: 'Location',
  dim_vehicle_year: 'Vehicle year',
  dim_fuel: 'Fuel type',
  dim_transmission: 'Transmission',
  dim_seller_type: 'Seller type',
}
const CAMERA_DIRECTION = new Vector3(0.12, 0.68, 0.73).normalize()

function PatternEdge({ relationship, selectedNodeId }) {
  const dimension = TABLES_BY_ID[relationship.dimensionTable]
  const start = new Vector3(dimension.position[0], 0.3, dimension.position[2])
  const end = new Vector3(FACT_TABLE.position[0], 0.3, FACT_TABLE.position[2])
  const direction = end.clone().sub(start).normalize()
  const arrowRotation = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction,
  )
  const highlighted = selectedNodeId === FACT_TABLE.id
    || selectedNodeId === relationship.dimensionTable

  return (
    <>
      <Line
        color={highlighted ? '#70e7ef' : '#38536f'}
        lineWidth={highlighted ? 3 : 1.5}
        opacity={highlighted ? 0.95 : 0.62}
        points={[start, end]}
        transparent
      />
      <mesh
        position={end.clone().addScaledVector(direction, -1.15)}
        quaternion={arrowRotation}
      >
        <coneGeometry args={[0.14, 0.38, 8]} />
        <meshStandardMaterial
          color={highlighted ? '#70e7ef' : '#7189a7'}
          emissive={highlighted ? '#39c8d4' : '#29374a'}
          emissiveIntensity={highlighted ? 0.35 : 0.12}
        />
      </mesh>
    </>
  )
}

function GraphNode({ node, selected, onSelect }) {
  const meshRef = useRef(null)
  const isFact = node.kind === 'FACT'

  useFrame((_, delta) => {
    if (meshRef.current) {
      const target = selected ? 1.22 : 1
      const amount = 1 - Math.exp(-8 * delta)
      const next = meshRef.current.scale.x + (target - meshRef.current.scale.x) * amount
      meshRef.current.scale.setScalar(next)
    }
  })

  function selectNode(event) {
    event.stopPropagation()
    onSelect(node.id)
  }

  return (
    <mesh
      ref={meshRef}
      position={node.position}
      onClick={selectNode}
    >
      <sphereGeometry args={[isFact ? 0.84 : 0.59, 28, 20]} />
      <meshStandardMaterial
        color={selected ? '#36c6d3' : isFact ? '#14768b' : '#6052a8'}
        emissive={selected ? '#3be0eb' : isFact ? '#167b91' : '#594bb1'}
        emissiveIntensity={selected ? 0.55 : 0.3}
        metalness={0.25}
        roughness={0.34}
      />
    </mesh>
  )
}

function ProjectedNodeLabels({ labelRefs, nodes }) {
  const { camera, size } = useThree()
  const projectedNodes = useRef(
    nodes.map((node) => ({
      id: node.id,
      position: new Vector3(
        node.position[0],
        node.position[1] + (node.kind === 'FACT' ? 1.45 : 1.05),
        node.position[2],
      ),
    })),
  )

  useFrame(() => {
    const stackLabels = size.width < 720
    projectedNodes.current.forEach(({ id, position }, index) => {
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
        ? (size.height / projectedNodes.current.length) * (index + 0.5)
        : (-projected.y * 0.5 + 0.5) * size.height
      element.style.left = `${left}px`
      element.style.top = `${top}px`
      element.style.visibility = visible ? 'visible' : 'hidden'
    })
  })

  return null
}

function GraphContents({ labelRefs, onSelect, selectedNodeId, nodes }) {
  const controlsRef = useRef(null)
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1)
    const halfWidthDistance = 10.6
      / (Math.tan((camera.fov * Math.PI) / 360) * aspect)
    const distance = Math.max(18, halfWidthDistance)
    camera.position.copy(CAMERA_DIRECTION).multiplyScalar(distance)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update()
    controlsRef.current?.saveState()
  }, [camera, size.height, size.width])

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[6, 11, 5]} intensity={2.2} />
      <pointLight color="#55d9e8" position={[-5, 5, -5]} intensity={38} distance={20} />
      <gridHelper
        args={[24, 32, '#28465e', '#14273a']}
        position={[0, -0.3, 0]}
      />
      {STAR_SCHEMA_RELATIONSHIPS.map((relationship) => (
        <PatternEdge
          key={relationship.id}
          relationship={relationship}
          selectedNodeId={selectedNodeId}
        />
      ))}
      {nodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          onSelect={onSelect}
          selected={selectedNodeId === node.id}
        />
      ))}
      <ProjectedNodeLabels labelRefs={labelRefs} nodes={nodes} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        dampingFactor={0.08}
        enableDamping
        enablePan
        maxDistance={52}
        minDistance={12}
      />
    </>
  )
}

const GRAPH_NODES = STAR_SCHEMA_TABLES.map((table) => ({
  ...table,
  label: NODE_LABELS[table.id],
}))

function PatternGraphScene({ onSelect, selectedNodeId }) {
  const labelRefs = useRef({})

  return (
    <div className="pattern-graph-scene">
      <div
        aria-label="Interactive graph preview of Star Schema relationships"
        className="pattern-graph-canvas"
      >
        <Canvas
          camera={{ fov: 42, position: [2, 14, 18] }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
        >
          <GraphContents
            labelRefs={labelRefs}
            nodes={GRAPH_NODES}
            onSelect={onSelect}
            selectedNodeId={selectedNodeId}
          />
        </Canvas>
      </div>
      <div className="pattern-graph-label-layer">
        {GRAPH_NODES.map((node) => (
          <button
            aria-pressed={selectedNodeId === node.id}
            aria-label={`Select graph node ${node.label}`}
            className={[
              'pattern-graph-label',
              node.kind === 'FACT' ? 'is-fact' : 'is-dimension',
              selectedNodeId === node.id ? 'is-selected' : '',
            ].filter(Boolean).join(' ')}
            key={node.id}
            onClick={() => onSelect(node.id)}
            ref={(element) => {
              labelRefs.current[node.id] = element
            }}
            type="button"
          >
            <span>{node.kind === 'FACT' ? 'FACT NODE' : 'ATTRIBUTE NODE'}</span>
            <strong>{node.label}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PatternGraphScene
