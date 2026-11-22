import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Premium automotive luxury paint finishes
const PAINT_COLORS = [
  { name: 'Electric Cyan Metallic', hex: '#00d2ff', metalness: 0.92, roughness: 0.18, clearcoat: 0.9 },
  { name: 'Deep Sapphire Blue', hex: '#1d4ed8', metalness: 0.90, roughness: 0.20, clearcoat: 0.85 },
  { name: 'Monza Crimson Red', hex: '#e11d48', metalness: 0.88, roughness: 0.22, clearcoat: 0.85 },
  { name: 'Obsidian Carbon Black', hex: '#0f172a', metalness: 0.95, roughness: 0.15, clearcoat: 0.95 },
  { name: 'Liquid Platinum Silver', hex: '#cbd5e1', metalness: 0.94, roughness: 0.14, clearcoat: 0.9 },
  { name: 'Verde Mantis Green', hex: '#059669', metalness: 0.89, roughness: 0.22, clearcoat: 0.85 },
]

function DetailedWheel({ isFront, position }) {
  const wheelGroup = useRef(null)

  // Gentle wheel spin matching the idle studio showroom motion
  useFrame((_, delta) => {
    if (wheelGroup.current) {
      wheelGroup.current.rotation.x += delta * 0.8
    }
  })

  const tireMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0d1117',
    roughness: 0.88,
    metalness: 0.08,
  }), [])

  const rimAlloyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f1f5f9',
    metalness: 0.95,
    roughness: 0.18,
  }), [])

  const rimInnerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b',
    metalness: 0.85,
    roughness: 0.35,
  }), [])

  const rotorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    metalness: 0.9,
    roughness: 0.28,
  }), [])

  const caliperMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#00d2ff',
    metalness: 0.82,
    roughness: 0.24,
  }), [])

  return (
    <group position={position}>
      {/* Rotating Wheel Assembly */}
      <group ref={wheelGroup}>
        {/* Outer Rubber Tyre */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.24, 32]} />
          <primitive object={tireMaterial} />
        </mesh>
        {/* Rounded Tyre Shoulder (Front & Back Torus bevels) */}
        <mesh position={[0.11, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.31, 0.04, 16, 32]} />
          <primitive object={tireMaterial} />
        </mesh>
        <mesh position={[-0.11, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.31, 0.04, 16, 32]} />
          <primitive object={tireMaterial} />
        </mesh>

        {/* Wheel Barrel (Inner Rim) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.26, 0.25, 24]} />
          <primitive object={rimInnerMaterial} />
        </mesh>

        {/* Outer Polished Lip */}
        <mesh position={[position[0] > 0 ? 0.12 : -0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.22, 0.26, 28]} />
          <primitive object={rimAlloyMaterial} />
        </mesh>

        {/* 5 Double-Spoke Forged Alloy Wheel */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5
          return (
            <group key={i} rotation={[angle, 0, 0]}>
              <mesh position={[position[0] > 0 ? 0.11 : -0.11, 0.12, 0]}>
                <boxGeometry args={[0.02, 0.22, 0.038]} />
                <primitive object={rimAlloyMaterial} />
              </mesh>
            </group>
          )
        })}

        {/* Center Hub Cap with Chrome Nut Details */}
        <mesh position={[position[0] > 0 ? 0.125 : -0.125, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.025, 18]} />
          <primitive object={rimAlloyMaterial} />
        </mesh>
      </group>

      {/* Static High-Performance Brake Assembly */}
      {/* Drilled Brake Rotor Disc */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
        <primitive object={rotorMaterial} />
      </mesh>
      {/* Brembo-Style High-Performance Brake Caliper */}
      <mesh position={[position[0] > 0 ? 0.06 : -0.06, 0.14, isFront ? 0.08 : -0.08]} rotation={[0, 0, isFront ? -0.3 : 0.3]}>
        <boxGeometry args={[0.07, 0.13, 0.18]} />
        <primitive object={caliperMaterial} />
      </mesh>
    </group>
  )
}

function RealisticCar({ bodyColor }) {
  const carGroup = useRef(null)

  // Gentle suspension idle motion
  useFrame((state) => {
    if (carGroup.current) {
      carGroup.current.position.y = 0.36 + Math.sin(state.clock.elapsedTime * 1.8) * 0.012
    }
  })

  // Automotive Paint Material
  const paintMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: bodyColor.hex,
    metalness: bodyColor.metalness,
    roughness: bodyColor.roughness,
    clearcoat: bodyColor.clearcoat,
    clearcoatRoughness: 0.1,
    reflectivity: 0.95,
    envMapIntensity: 1.4,
  }), [bodyColor])

  // Gloss Carbon-Fiber Trim
  const carbonMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#090d16',
    metalness: 0.85,
    roughness: 0.25,
  }), [])

  // Automotive Glass
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#081226',
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.85,
    transmission: 0.6,
    ior: 1.52,
    reflectivity: 0.9,
  }), [])

  // Projector Headlights
  const headlightLensMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#62dce9',
    emissive: '#62dce9',
    emissiveIntensity: 3.2,
    roughness: 0.1,
  }), [])

  const headlightHousingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#020617',
    metalness: 0.9,
    roughness: 0.2,
  }), [])

  // Rear LED Taillight Bar
  const taillightMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ff1744',
    emissive: '#ff1744',
    emissiveIntensity: 2.8,
  }), [])

  // Chrome / Polished Titanium Exhausts
  const exhaustMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    metalness: 0.98,
    roughness: 0.12,
  }), [])

  return (
    <group ref={carGroup} position={[0, 0.36, 0]}>
      {/* ========================================================
          1. CHASSIS & AERODYNAMIC LOWER SILLS
         ======================================================== */}
      {/* Main Floor Pan / Underbody Tub */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.72, 0.16, 4.15]} />
        <primitive object={carbonMaterial} />
      </mesh>

      {/* Lower Body Side Sills with Carbon Aero Blades */}
      <mesh position={[-0.88, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.14, 3.2]} />
        <primitive object={carbonMaterial} />
      </mesh>
      <mesh position={[0.88, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.14, 3.2]} />
        <primitive object={carbonMaterial} />
      </mesh>

      {/* ========================================================
          2. LOWER SCULPTED BODY & BELTLINE
         ======================================================== */}
      {/* Central Waist Body */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.82, 0.24, 4.1]} />
        <primitive object={paintMaterial} />
      </mesh>

      {/* Front Hood with Aerodynamic Sloping Power Creases */}
      <group position={[0, 0.34, 1.25]} rotation={[-0.14, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.76, 0.18, 1.55]} />
          <primitive object={paintMaterial} />
        </mesh>
        {/* Center Hood Power-Dome Crease */}
        <mesh position={[0, 0.1, 0.05]}>
          <boxGeometry args={[0.62, 0.04, 1.3]} />
          <primitive object={paintMaterial} />
        </mesh>
      </group>

      {/* Front Nose Cone Drop */}
      <mesh position={[0, 0.22, 2.08]} rotation={[-0.28, 0, 0]}>
        <boxGeometry args={[1.72, 0.18, 0.32]} />
        <primitive object={paintMaterial} />
      </mesh>

      {/* Front Bumper & High-Flow Mesh Grille Intake */}
      <mesh position={[0, 0.12, 2.14]}>
        <boxGeometry args={[1.1, 0.16, 0.06]} />
        <primitive object={carbonMaterial} />
      </mesh>
      {/* Front Carbon Aero Splitter */}
      <mesh position={[0, 0.04, 2.18]}>
        <boxGeometry args={[1.84, 0.04, 0.32]} />
        <primitive object={carbonMaterial} />
      </mesh>
      {/* Splitter Endplate Winglets */}
      <mesh position={[-0.91, 0.08, 2.16]}>
        <boxGeometry args={[0.03, 0.12, 0.24]} />
        <primitive object={carbonMaterial} />
      </mesh>
      <mesh position={[0.91, 0.08, 2.16]}>
        <boxGeometry args={[0.03, 0.12, 0.24]} />
        <primitive object={carbonMaterial} />
      </mesh>

      {/* Rear Decklid / Fastback Trunk Profile */}
      <mesh position={[0, 0.40, -1.45]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[1.74, 0.22, 1.15]} />
        <primitive object={paintMaterial} />
      </mesh>

      {/* ========================================================
          3. GREENHOUSE / CABIN & GLASS
         ======================================================== */}
      {/* Raked Windshield (Front Glass) */}
      <mesh position={[0, 0.62, 0.68]} rotation={[-0.56, 0, 0]}>
        <boxGeometry args={[1.42, 0.04, 1.05]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Aerodynamic Roof Panel */}
      <mesh position={[0, 0.88, -0.22]}>
        <boxGeometry args={[1.36, 0.05, 1.35]} />
        <primitive object={paintMaterial} />
      </mesh>

      {/* Fastback Sloping Rear Window */}
      <mesh position={[0, 0.68, -1.08]} rotation={[0.54, 0, 0]}>
        <boxGeometry args={[1.38, 0.04, 0.95]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Side Windows (Left & Right) */}
      <mesh position={[-0.72, 0.65, -0.22]}>
        <boxGeometry args={[0.04, 0.38, 1.48]} />
        <primitive object={glassMaterial} />
      </mesh>
      <mesh position={[0.72, 0.65, -0.22]}>
        <boxGeometry args={[0.04, 0.38, 1.48]} />
        <primitive object={glassMaterial} />
      </mesh>

      {/* Roof A-Pillars (Left & Right) */}
      <mesh position={[-0.70, 0.63, 0.66]} rotation={[-0.56, 0, 0.12]}>
        <boxGeometry args={[0.08, 0.06, 1.05]} />
        <primitive object={paintMaterial} />
      </mesh>
      <mesh position={[0.70, 0.63, 0.66]} rotation={[-0.56, 0, -0.12]}>
        <boxGeometry args={[0.08, 0.06, 1.05]} />
        <primitive object={paintMaterial} />
      </mesh>

      {/* C-Pillars (Rear Haunches) */}
      <mesh position={[-0.71, 0.68, -1.06]} rotation={[0.54, 0, -0.12]}>
        <boxGeometry args={[0.09, 0.06, 0.95]} />
        <primitive object={paintMaterial} />
      </mesh>
      <mesh position={[0.71, 0.68, -1.06]} rotation={[0.54, 0, 0.12]}>
        <boxGeometry args={[0.09, 0.06, 0.95]} />
        <primitive object={paintMaterial} />
      </mesh>

      {/* ========================================================
          4. HEADLIGHTS & FRONT LIGHTING SIGNATURE
         ======================================================== */}
      {/* Left Dual Projector Headlight Assembly */}
      <group position={[-0.66, 0.32, 2.02]} rotation={[0, -0.22, 0]}>
        <mesh>
          <boxGeometry args={[0.38, 0.09, 0.12]} />
          <primitive object={headlightHousingMaterial} />
        </mesh>
        {/* Projector LED Lenses */}
        <mesh position={[-0.08, 0, 0.06]}>
          <sphereGeometry args={[0.038, 16, 16]} />
          <primitive object={headlightLensMaterial} />
        </mesh>
        <mesh position={[0.08, 0, 0.06]}>
          <sphereGeometry args={[0.038, 16, 16]} />
          <primitive object={headlightLensMaterial} />
        </mesh>
        {/* Daytime Running Light Accent Eyebrow */}
        <mesh position={[0, 0.045, 0.06]}>
          <boxGeometry args={[0.34, 0.015, 0.02]} />
          <primitive object={headlightLensMaterial} />
        </mesh>
      </group>

      {/* Right Dual Projector Headlight Assembly */}
      <group position={[0.66, 0.32, 2.02]} rotation={[0, 0.22, 0]}>
        <mesh>
          <boxGeometry args={[0.38, 0.09, 0.12]} />
          <primitive object={headlightHousingMaterial} />
        </mesh>
        <mesh position={[-0.08, 0, 0.06]}>
          <sphereGeometry args={[0.038, 16, 16]} />
          <primitive object={headlightLensMaterial} />
        </mesh>
        <mesh position={[0.08, 0, 0.06]}>
          <sphereGeometry args={[0.038, 16, 16]} />
          <primitive object={headlightLensMaterial} />
        </mesh>
        <mesh position={[0, 0.045, 0.06]}>
          <boxGeometry args={[0.34, 0.015, 0.02]} />
          <primitive object={headlightLensMaterial} />
        </mesh>
      </group>

      {/* ========================================================
          5. REAR FASCIA, DIFFUSER & TAILLIGHT BAR
         ======================================================== */}
      {/* Full-Width Rear LED Taillight Blade */}
      <mesh position={[0, 0.44, -2.08]}>
        <boxGeometry args={[1.68, 0.05, 0.05]} />
        <primitive object={taillightMaterial} />
      </mesh>
      {/* Rear Bumper Deck */}
      <mesh position={[0, 0.26, -2.06]}>
        <boxGeometry args={[1.74, 0.24, 0.18]} />
        <primitive object={paintMaterial} />
      </mesh>

      {/* Carbon Aero Ducktail Spoiler */}
      <mesh position={[0, 0.53, -1.98]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.68, 0.04, 0.22]} />
        <primitive object={carbonMaterial} />
      </mesh>

      {/* Rear Aerodynamic Diffuser with Strakes */}
      <mesh position={[0, 0.08, -2.08]}>
        <boxGeometry args={[1.64, 0.14, 0.24]} />
        <primitive object={carbonMaterial} />
      </mesh>
      {/* Diffuser Aerodynamic Fins */}
      {[-0.5, -0.2, 0.2, 0.5].map((pos, idx) => (
        <mesh key={idx} position={[pos, 0.06, -2.14]}>
          <boxGeometry args={[0.02, 0.10, 0.18]} />
          <primitive object={carbonMaterial} />
        </mesh>
      ))}

      {/* Dual Performance Chrome Exhaust Tips */}
      <mesh position={[-0.55, 0.10, -2.20]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.16, 20]} />
        <primitive object={exhaustMaterial} />
      </mesh>
      <mesh position={[0.55, 0.10, -2.20]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.16, 20]} />
        <primitive object={exhaustMaterial} />
      </mesh>

      {/* ========================================================
          6. AERODYNAMIC SIDE-VIEW MIRRORS
         ======================================================== */}
      <group position={[-0.92, 0.58, 0.48]}>
        {/* Mirror Stalk */}
        <mesh rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <primitive object={carbonMaterial} />
        </mesh>
        {/* Mirror Housing */}
        <mesh position={[-0.08, 0.04, 0]}>
          <boxGeometry args={[0.16, 0.09, 0.14]} />
          <primitive object={paintMaterial} />
        </mesh>
        {/* Mirror Glass */}
        <mesh position={[-0.08, 0.04, -0.07]}>
          <boxGeometry args={[0.14, 0.07, 0.01]} />
          <primitive object={exhaustMaterial} />
        </mesh>
      </group>

      <group position={[0.92, 0.58, 0.48]}>
        <mesh rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.12, 0.03, 0.04]} />
          <primitive object={carbonMaterial} />
        </mesh>
        <mesh position={[0.08, 0.04, 0]}>
          <boxGeometry args={[0.16, 0.09, 0.14]} />
          <primitive object={paintMaterial} />
        </mesh>
        <mesh position={[0.08, 0.04, -0.07]}>
          <boxGeometry args={[0.14, 0.07, 0.01]} />
          <primitive object={exhaustMaterial} />
        </mesh>
      </group>

      {/* ========================================================
          7. FOUR HIGH-PERFORMANCE WHEELS & TYRES
         ======================================================== */}
      <DetailedWheel isFront position={[-0.94, 0, 1.28]} />
      <DetailedWheel isFront position={[0.94, 0, 1.28]} />
      <DetailedWheel isFront={false} position={[-0.94, 0, -1.28]} />
      <DetailedWheel isFront={false} position={[0.94, 0, -1.28]} />

      {/* ========================================================
          8. SUBTLE HIGH-TECH CHASSIS UNDERGLOW
         ======================================================== */}
      <mesh position={[0, -0.30, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 4.0]} />
        <meshBasicMaterial
          color={bodyColor.hex}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function StudioPlatform() {
  return (
    <group position={[0, 0, 0]}>
      {/* Soft Contact Ambient Occlusion Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[2.4, 4.8]} />
        <meshBasicMaterial
          color="#020617"
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Circular Showroom Turntable Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[4.4, 64]} />
        <meshStandardMaterial
          color="#0b1329"
          roughness={0.35}
          metalness={0.85}
        />
      </mesh>

      {/* Concentric Electric Cyan Halo Lighting Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[4.28, 4.36, 64]} />
        <meshBasicMaterial color="#00d2ff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[2.9, 2.93, 64]} />
        <meshBasicMaterial color="rgba(0, 210, 255, 0.35)" transparent />
      </mesh>
    </group>
  )
}

export default function InteractiveCarStudio() {
  const [selectedColor, setSelectedColor] = useState(PAINT_COLORS[0])
  const [hasWebGL, setHasWebGL] = useState(true)

  return (
    <section aria-labelledby="vehicle-studio-title" className="vehicle-studio">
      <div className="vehicle-studio-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="customer-eyebrow-dot" style={{ background: '#00d2ff', boxShadow: '0 0 10px #00d2ff' }} />
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', color: '#e2e8f0', textTransform: 'uppercase' }}>
            VMA High-Performance 3D Studio
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="vehicle-studio-status"
            style={{
              background: 'rgba(0, 210, 255, 0.12)',
              color: '#00d2ff',
              border: '1px solid rgba(0, 210, 255, 0.3)',
              fontSize: '10px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            360° INTERACTIVE
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Drag to rotate · Scroll to zoom</span>
        </div>
      </div>

      <div
        className="vehicle-studio-stage"
        style={{
          position: 'relative',
          height: '340px',
          width: '100%',
          background: 'radial-gradient(ellipse at center, #111d35 0%, #060b17 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(0, 210, 255, 0.06)',
        }}
      >
        <div aria-hidden="true" className="vehicle-studio-grid" />
        <div aria-hidden="true" className="vehicle-studio-glow" />

        {hasWebGL ? (
          <Canvas
            camera={{ position: [4.2, 1.9, 4.2], fov: 40 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.2
            }}
            onError={() => setHasWebGL(false)}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Studio Lighting Rig */}
            <ambientLight intensity={0.7} color="#dbeafe" />
            <directionalLight position={[6, 9, 6]} intensity={2.0} color="#ffffff" />
            <directionalLight position={[-7, 7, -6]} intensity={1.4} color="#38bdf8" />
            <spotLight
              position={[0, 10, 0]}
              intensity={2.5}
              angle={0.65}
              penumbra={0.8}
              color="#ffffff"
            />
            {/* Ground Rim Glow */}
            <pointLight position={[0, 0.2, 0]} intensity={1.6} color={selectedColor.hex} distance={5} />

            <Suspense fallback={null}>
              <RealisticCar bodyColor={selectedColor} />
              <StudioPlatform />
            </Suspense>

            <OrbitControls
              autoRotate
              autoRotateSpeed={1.0}
              enableDamping
              dampingFactor={0.05}
              enablePan={false}
              enableZoom={true}
              maxDistance={7.5}
              minDistance={3.0}
              maxPolarAngle={Math.PI / 2.05}
              minPolarAngle={Math.PI / 5.0}
            />
          </Canvas>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>WebGL 3D Studio Preview</span>
          </div>
        )}

        <div
          className="vehicle-studio-caption"
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            background: 'rgba(6, 11, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}
        >
          <strong id="vehicle-studio-title" style={{ fontSize: '12px', color: '#f8fafc', display: 'block' }}>
            17,437 Verified Warehouse Vehicles
          </strong>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            Star Schema Fact Table · High-Performance Dimensional Analytics
          </span>
        </div>
      </div>

      <div
        className="vehicle-studio-footer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(11, 19, 35, 0.95)',
          borderTop: '1px solid rgba(148, 163, 184, 0.15)',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
            Finish:
          </span>
          {PAINT_COLORS.map((color) => (
            <button
              key={color.name}
              title={color.name}
              type="button"
              onClick={() => setSelectedColor(color)}
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: color.hex,
                border: selectedColor.name === color.name ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.25)',
                boxShadow: selectedColor.name === color.name ? `0 0 10px ${color.hex}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: selectedColor.name === color.name ? 'scale(1.25)' : 'scale(1)',
                padding: 0,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#62dce9', fontWeight: '600' }}>{selectedColor.name}</span>
          <span style={{ fontSize: '10px', color: '#64748b' }}>· Metallic Clearcoat</span>
        </div>
      </div>
    </section>
  )
}
