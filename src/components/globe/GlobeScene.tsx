"use client";

import React, { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FLOOD_EVENTS } from "@/data/floodEvents";
import { FloodEvent } from "@/types/flood";
import { useFloodStore } from "@/store/useFloodStore";

const GLOBE_RADIUS = 2.0;

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Single pulsing marker component
interface MarkerProps {
  event: FloodEvent;
  onHover: (event: FloodEvent | null, screenPos?: { x: number; y: number }) => void;
  onClick: (event: FloodEvent) => void;
}

const FloodMarker: React.FC<MarkerProps> = ({ event, onHover, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const pos = useMemo(
    () => latLonToVector3(event.lat, event.lon, GLOBE_RADIUS),
    [event.lat, event.lon]
  );

  const normal = useMemo(() => pos.clone().normalize(), [pos]);
  const orientation = useMemo(() => {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return quaternion;
  }, [normal]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const scale = 1 + (Math.sin(t * 3 + event.eventCount) + 1) * 0.8;
      ringRef.current.scale.set(scale, scale, scale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 0.9 - (scale - 1) * 0.55);
      }
    }
    if (ring2Ref.current) {
      const scale2 = 1 + (Math.sin(t * 3 + event.eventCount + 1.5) + 1) * 0.8;
      ring2Ref.current.scale.set(scale2, scale2, scale2);
      const mat2 = ring2Ref.current.material as THREE.MeshBasicMaterial;
      if (mat2) {
        mat2.opacity = Math.max(0, 0.7 - (scale2 - 1) * 0.45);
      }
    }
  });

  return (
    <group ref={meshRef} position={pos} quaternion={orientation}>
      {/* Interaction Hit Area */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(event, { x: e.clientX, y: e.clientY });
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
        scale={hovered ? [1.6, 1.6, 1.6] : [1, 1, 1]}
      >
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial
          color={hovered ? "#00F0FF" : "#38bdf8"}
          toneMapped={false}
        />
      </mesh>

      {/* Central Pulsing Sphere */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#00F0FF"} />
      </mesh>

      {/* Outward Radar Beacon Spike */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.006, 0.015, 0.25, 8]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={hovered ? 0.95 : 0.65}
        />
      </mesh>

      {/* Concentric Expanding Shockwave Rings */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.06, 0.09, 32]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.08, 0.11, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Earth Sphere Mesh using official NASA Blue Marble texture maps
interface EarthSphereProps {
  onHover: (event: FloodEvent | null, screenPos?: { x: number; y: number }) => void;
  onSelect: (event: FloodEvent) => void;
  isInteracting: boolean;
}

const EarthSphere: React.FC<EarthSphereProps> = ({
  onHover,
  onSelect,
  isInteracting,
}) => {
  const globeRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load NASA Blue Marble maps directly from /textures
  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    "/textures/earth_blue_marble.jpg",
    "/textures/earth_normal.jpg",
    "/textures/earth_specular.jpg",
    "/textures/earth_clouds.png",
  ]);

  useFrame((_, delta) => {
    if (globeRef.current && !isInteracting) {
      globeRef.current.rotation.y += delta * 0.08; // Smooth idle auto-rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.11; // Clouds drift slightly faster
    }
  });

  return (
    <group>
      {/* Rotating Globe Body */}
      <group ref={globeRef}>
        {/* Main NASA Blue Marble Textured Sphere */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <meshStandardMaterial
            map={colorMap}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.85, 0.85)}
            roughnessMap={specularMap}
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>

        {/* Dynamic Atmospheric Clouds Layer */}
        <mesh ref={cloudsRef} scale={[1.014, 1.014, 1.014]}>
          <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent
            opacity={0.38}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 8 Global Flood Event Pulsing Markers */}
        {FLOOD_EVENTS.map((event) => (
          <FloodMarker
            key={event.id}
            event={event}
            onHover={onHover}
            onClick={onSelect}
          />
        ))}
      </group>

      {/* Atmospheric Rayleigh Backside Glow */}
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export const GlobeScene: React.FC = () => {
  const { setModalEvent, setTooltipEvent } = useFloodStore();
  const [isInteracting, setIsInteracting] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    setIsInteracting(true);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
  };

  const handlePointerUp = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2500); // Resume auto-rotation after 2.5s idle
  };

  const handleMarkerHover = (
    event: FloodEvent | null,
    screenPos?: { x: number; y: number }
  ) => {
    if (event && screenPos) {
      setTooltipEvent({ event, x: screenPos.x, y: screenPos.y });
    } else {
      setTooltipEvent(null);
    }
  };

  const handleMarkerClick = (event: FloodEvent) => {
    setModalEvent(event);
  };

  return (
    <div
      className="relative w-full h-full bg-space-950 overflow-hidden cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={[1, 1.5]} // Adaptive DPR clamped at 1.5x for 60fps
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 5, 5]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-8, -4, -5]} intensity={0.6} color="#00F0FF" />
        <pointLight position={[0, 10, 5]} intensity={0.5} color="#38bdf8" />

        <Stars
          radius={80}
          depth={50}
          count={2500}
          factor={4}
          saturation={0.5}
          fade
          speed={0.8}
        />

        <Suspense
          fallback={
            <mesh>
              <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
              <meshBasicMaterial color="#081b33" wireframe />
            </mesh>
          }
        >
          <EarthSphere
            onHover={handleMarkerHover}
            onSelect={handleMarkerClick}
            isInteracting={isInteracting}
          />
        </Suspense>

        <OrbitControls
          target={[0, 0, 0]}
          enablePan={false}
          enableZoom={true}
          minDistance={3.0}
          maxDistance={7.5}
          rotateSpeed={0.6}
          zoomSpeed={0.7}
          dampingFactor={0.06}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
};
