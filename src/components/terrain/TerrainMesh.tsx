"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useFloodStore } from "@/store/useFloodStore";

interface TerrainMeshProps {
  onHoverPoint: (
    point: {
      x: number;
      z: number;
      elevation: number;
      depth: number;
      risk: "Dry" | "Low" | "Moderate" | "High" | "Critical";
    } | null
  ) => void;
}

export const TerrainMesh: React.FC<TerrainMeshProps> = ({ onHoverPoint }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  const { terrainControls, terrainResetTrigger } = useFloodStore();
  const { showTerrain, showWater, showHeatmap, showRisk, waterLevel, exaggeration } =
    terrainControls;

  // Grid resolution for high-detail DEM
  const resolution = 128;
  const size = 18;

  // Generate synthetic authentic river valley DEM elevation
  const { geometry, elevations, riverDepths } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const elevs = new Float32Array(pos.count);
    const depths = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Meandering river centerline path: x_river = sin(z * 0.3) * 3.2
      const riverX = Math.sin(z * 0.28) * 3.0 + Math.cos(z * 0.15) * 1.2;
      const distToRiver = Math.abs(x - riverX);

      // Natural river valley trough + rolling hills
      const valley = Math.pow(distToRiver / 6.0, 1.6);
      const hills =
        Math.sin(x * 0.45) * 0.5 +
        Math.cos(z * 0.38) * 0.6 +
        Math.sin((x + z) * 0.2) * 0.4;
      const bluffs = Math.max(0, Math.abs(x) - 4.5) * 0.6;

      // Base elevation in meters
      let elev = valley * 1.4 + hills * 0.4 + bluffs;
      if (distToRiver < 1.8) {
        // Riverbed deepening
        elev -= (1.8 - distToRiver) * 0.7;
      }

      elev = Math.max(-0.6, elev);
      elevs[i] = elev;

      // Simulated flood depth field relative to river basin
      const floodHeight = waterLevel;
      const waterDepthAtPoint = Math.max(0, floodHeight - elev);
      depths[i] = waterDepthAtPoint;

      // Apply vertical elevation
      pos.setY(i, elev * exaggeration);
    }

    geo.computeVertexNormals();
    return { geometry: geo, elevations: elevs, riverDepths: depths };
  }, [exaggeration, waterLevel]);

  // Compute dynamic vertex colors based on active layers
  useEffect(() => {
    if (!meshRef.current) return;
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const cLow = new THREE.Color("#06b6d4");
    const cMod = new THREE.Color("#3b82f6");
    const cHigh = new THREE.Color("#f59e0b");
    const cCrit = new THREE.Color("#ef4444");

    const cValley = new THREE.Color("#1a382b"); // Lush riverbank green
    const cAlluvial = new THREE.Color("#3d3322"); // Alluvial silt brown
    const cRocky = new THREE.Color("#4a4539"); // Rock bluff
    const cRidge = new THREE.Color("#6b6659"); // Peak ridge

    const cCyanGlow = new THREE.Color("#00F0FF");

    for (let i = 0; i < pos.count; i++) {
      const elev = elevations[i];
      const depth = riverDepths[i];
      const isFlooded = depth > 0.05;

      const vertexColor = new THREE.Color();

      if (showRisk && isFlooded) {
        // Multi-hazard classification
        if (depth > 2.8) vertexColor.copy(cCrit);
        else if (depth > 1.4) vertexColor.copy(cHigh);
        else if (depth > 0.6) vertexColor.copy(cMod);
        else vertexColor.copy(cLow);
      } else if (showHeatmap && isFlooded) {
        // Probability heatmap gradient (0.0 to 1.0)
        const prob = Math.min(1.0, depth / 2.5);
        vertexColor.setRGB(
          0.05 + prob * 0.1,
          0.4 + prob * 0.6,
          0.8 + prob * 0.2
        );
      } else if (isFlooded) {
        // Flooded pixels glow cyan
        const glowFactor = Math.min(1.0, depth / 2.0);
        vertexColor.copy(cLow).lerp(cCyanGlow, glowFactor * 0.6);
      } else if (showTerrain) {
        // Natural DEM topographic palette
        if (elev < 0.6) vertexColor.copy(cValley);
        else if (elev < 1.4) vertexColor.copy(cAlluvial);
        else if (elev < 2.5) vertexColor.copy(cRocky);
        else vertexColor.copy(cRidge);
      } else {
        // Neutral radar greyscale DEM
        const grey = Math.min(0.8, 0.15 + elev * 0.18);
        vertexColor.setRGB(grey, grey, grey);
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.attributes.color.needsUpdate = true;
  }, [geometry, elevations, riverDepths, showTerrain, showHeatmap, showRisk]);

  // Animate dynamic water plane ripples & caustics
  useFrame(({ clock }) => {
    if (waterRef.current && showWater) {
      const t = clock.getElapsedTime();
      waterRef.current.position.y =
        waterLevel * exaggeration + Math.sin(t * 1.5) * 0.025;
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.roughness = 0.15 + Math.sin(t * 2) * 0.05;
      }
    }
  });

  // Handle Raycaster hover probe
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.point) return;

    const x = e.point.x;
    const z = e.point.z;

    // Estimate elevation at cursor
    const riverX = Math.sin(z * 0.28) * 3.0 + Math.cos(z * 0.15) * 1.2;
    const dist = Math.abs(x - riverX);
    let elev = Math.pow(dist / 6.0, 1.6) * 1.4;
    if (dist < 1.8) elev -= (1.8 - dist) * 0.7;
    elev = Math.max(-0.6, elev);

    const depth = Math.max(0, waterLevel - elev);

    let risk: "Dry" | "Low" | "Moderate" | "High" | "Critical" = "Dry";
    if (depth > 2.8) risk = "Critical";
    else if (depth > 1.4) risk = "High";
    else if (depth > 0.6) risk = "Moderate";
    else if (depth > 0.05) risk = "Low";

    onHoverPoint({
      x: Number(x.toFixed(2)),
      z: Number(z.toFixed(2)),
      elevation: Number(elev.toFixed(2)),
      depth: Number(depth.toFixed(2)),
      risk,
    });
  };

  return (
    <group key={terrainResetTrigger}>
      {/* 3D Topographic DEM Mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerMove={handlePointerMove}
        onPointerOut={() => onHoverPoint(null)}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          vertexColors
          roughness={0.7}
          metalness={0.1}
          wireframe={false}
          flatShading={false}
        />
      </mesh>

      {/* Animated Water Surface Plane */}
      {showWater && (
        <mesh
          ref={waterRef}
          position={[0, waterLevel * exaggeration, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[size * 1.05, size * 1.05, 32, 32]} />
          <meshStandardMaterial
            color="#00c8e0"
            transparent
            opacity={0.65}
            roughness={0.12}
            metalness={0.6}
            envMapIntensity={1.2}
          />
        </mesh>
      )}

      {/* Grid Wireframe Base */}
      <gridHelper
        args={[size * 1.2, 24, "#00F0FF", "#0891b2"]}
        position={[0, -0.65 * exaggeration, 0]}
      />
    </group>
  );
};
