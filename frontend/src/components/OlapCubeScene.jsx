import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const CELL_SIZE = 0.78
const CELL_SPACING = 0.96
const LAYER_COLORS = ['#52dce7', '#63a9f6', '#a28af4', '#e7a260']

function CubeSection({ coordinates, resolution, selected, onSelect }) {
  const meshRef = useRef(null)
  const [x, y, z] = coordinates
  const extent = ((resolution - 1) * CELL_SPACING) / 2
  const color = LAYER_COLORS[z % LAYER_COLORS.length]

  useFrame((_, delta) => {
    if (meshRef.current) {
      const target = selected ? 1.04 : 1
      meshRef.current.scale.lerp(
        { x: target, y: target, z: target },
        1 - Math.exp(-9 * delta),
      )
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[
        x * CELL_SPACING - extent,
        y * CELL_SPACING - extent,
        z * CELL_SPACING - extent,
      ]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(coordinates)
      }}
    >
      <boxGeometry args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]} />
      <meshStandardMaterial
        color={selected ? '#a7f3f5' : color}
        emissive={selected ? '#38c4cf' : color}
        emissiveIntensity={selected ? 0.48 : 0.12}
        metalness={0.22}
        roughness={0.38}
      />
    </mesh>
  )
}

function CubeContents({
  dimensionOrder,
  operationView,
  onSelect,
  pivotTurns,
  resolution,
  selectedSection,
}) {
  const groupRef = useRef(null)
  const controlsRef = useRef(null)
  const sections = useMemo(() => {
    const result = []
    for (let x = 0; x < resolution; x += 1) {
      for (let y = 0; y < resolution; y += 1) {
        for (let z = 0; z < resolution; z += 1) {
          result.push([x, y, z])
        }
      }
    }
    return result
  }, [resolution])

  const visibleSections = sections.filter(([x, y, z]) => {
    if (operationView.type === 'slice') {
      const axis = dimensionOrder.indexOf(operationView.dimension)
      return [x, y, z][axis] === operationView.segment - 1
    }
    if (operationView.type === 'dice') {
      const firstAxis = dimensionOrder.indexOf(operationView.first.dimension)
      const secondAxis = dimensionOrder.indexOf(operationView.second.dimension)
      const coordinates = [x, y, z]
      return coordinates[firstAxis] === operationView.first.segment - 1
        && coordinates[secondAxis] === operationView.second.segment - 1
    }
    return true
  })

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetRotation = pivotTurns * (Math.PI / 2)
      groupRef.current.rotation.y += (
        targetRotation - groupRef.current.rotation.y
      ) * (1 - Math.exp(-7 * delta))
    }
  })

  useEffect(() => {
    controlsRef.current?.saveState()
  }, [])

  const extent = ((resolution - 1) * CELL_SPACING) / 2

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight color="#67ddec" position={[-4, 1, -3]} intensity={32} distance={11} />
      <gridHelper
        args={[12, 24, '#25435c', '#17283d']}
        position={[0, -extent - 0.58, 0]}
      />
      <group ref={groupRef}>
        {visibleSections.map((coordinates) => (
          <CubeSection
            key={coordinates.join('-')}
            coordinates={coordinates}
            onSelect={onSelect}
            resolution={resolution}
            selected={selectedSection?.join('-') === coordinates.join('-')}
          />
        ))}
      </group>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        minDistance={4}
        maxDistance={12}
      />
    </>
  )
}

function OlapCubeScene(props) {
  return (
    <div aria-label="Interactive three-dimensional OLAP cube preview" className="olap-canvas">
      <Canvas
        camera={{ position: [5.4, 4.7, 6.4], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <CubeContents {...props} />
      </Canvas>
    </div>
  )
}

export default OlapCubeScene
