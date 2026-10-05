"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { TerrainMesh } from "./TerrainMesh";
import { useFloodStore } from "@/store/useFloodStore";
import {
  RotateCcw,
  Layers,
  Droplet,
  Flame,
  ShieldAlert,
  Play,
  Pause,
  Compass,
  Sliders,
  Waves,
} from "lucide-react";

export const TerrainViewer: React.FC = () => {
  const {
    terrainControls,
    setTerrainControl,
    resetTerrainControls,
    selectedEvent,
    probedPoint,
    setProbedPoint,
  } = useFloodStore();

  const {
    showTerrain,
    showWater,
    showHeatmap,
    showRisk,
    waterLevel,
    autoRotate,
    exaggeration,
  } = terrainControls;

  const [isSimulatingWave, setIsSimulatingWave] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Dynamic flood wave propagation loop
  useEffect(() => {
    if (!isSimulatingWave) return;
    const interval = setInterval(() => {
      const t = Date.now() / 2400;
      const wave = 0.8 + ((Math.sin(t) + 1) / 2) * 3.4;
      setTerrainControl("waterLevel", parseFloat(wave.toFixed(2)));
    }, 40);
    return () => clearInterval(interval);
  }, [isSimulatingWave, setTerrainControl]);

  const handleReset = () => {
    setIsSimulatingWave(false);
    resetTerrainControls();
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[680px] bg-space-950 rounded-2xl border border-cyan-500/20 shadow-cyan-glow overflow-hidden select-none">
      {/* 3D R3F Canvas */}
      <Canvas
        camera={{ position: [12, 10, 14], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[15, 20, 10]}
          intensity={2.0}
          color="#ffffff"
          castShadow
        />
        <directionalLight
          position={[-10, 8, -10]}
          intensity={0.6}
          color="#00F0FF"
        />
        <pointLight position={[0, 12, 0]} intensity={0.8} color="#38bdf8" />

        <TerrainMesh onHoverPoint={setProbedPoint} />

        <OrbitControls
          ref={controlsRef}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          enableDamping={true}
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={6}
          maxDistance={32}
        />
      </Canvas>

      {/* Top Left Event Header HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="glass-panel px-4 py-2.5 rounded-xl border border-cyan-500/30 max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-neon animate-pulse" />
            <span className="font-heading font-bold text-sm text-slate-100 tracking-wide">
              {selectedEvent.country} Flood Basin DEM
            </span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
            {selectedEvent.region}
          </div>
          <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 mt-1.5 pt-1.5 border-t border-white/10">
            <span>RESNET-34 IoU: {selectedEvent.unetPlusIoU.toFixed(2)}</span>
            <span>&bull;</span>
            <span>PINN MAX DEPTH: {selectedEvent.pinnMaxDepthM}m</span>
          </div>
        </div>
      </div>

      {/* Top Right Control HUD: Action Toggles & Sliders */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2.5 items-end">
        {/* Hero Layer Toggle Buttons: [Terrain] [Water] [Heatmap] [Risk] [Reset] */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl glass-panel border border-cyan-500/30 shadow-cyan-glow">
          <button
            onClick={() => setTerrainControl("showTerrain", !showTerrain)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all ${
              showTerrain
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>

          <button
            onClick={() => setTerrainControl("showWater", !showWater)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all ${
              showWater
                ? "bg-cyan-500/20 text-cyan-neon border border-cyan-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 bg-white/5"
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Water</span>
          </button>

          <button
            onClick={() => setTerrainControl("showHeatmap", !showHeatmap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all ${
              showHeatmap
                ? "bg-blue-500/25 text-blue-300 border border-blue-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => setTerrainControl("showRisk", !showRisk)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all ${
              showRisk
                ? "bg-red-500/25 text-red-300 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 bg-white/5"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk</span>
          </button>

          <div className="w-px h-5 bg-white/15 mx-0.5" />

          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-300 hover:text-cyan-neon hover:bg-cyan-500/10 border border-white/5 transition-all flex items-center space-x-1"
            title="Reset View and Settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Secondary controls: Interactive Water Level Slider, Wave Sim, & Auto-Rotate */}
        <div className="glass-panel p-3 rounded-xl border border-white/10 w-64 space-y-3">
          {/* Water Level Slider */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-cyan-400" />
                PINN Flood Stage:
              </span>
              <span className="text-cyan-neon font-bold">
                {waterLevel.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="4.5"
              step="0.1"
              value={waterLevel}
              onChange={(e) => {
                setIsSimulatingWave(false);
                setTerrainControl("waterLevel", parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>0.2m (Baseflow)</span>
              <span>4.5m (Extreme Peak)</span>
            </div>
          </div>

          {/* Dynamic Wave Simulation Toggle */}
          <div>
            <button
              onClick={() => setIsSimulatingWave(!isSimulatingWave)}
              className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold flex items-center justify-between transition-all ${
                isSimulatingWave
                  ? "bg-cyan-500/25 border border-cyan-400/50 text-cyan-neon shadow-cyan-glow"
                  : "bg-space-900 border border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Waves className={`w-3.5 h-3.5 ${isSimulatingWave ? "animate-pulse" : ""}`} />
                <span>Wave Simulation</span>
              </span>
              <span className="text-[10px] uppercase font-bold">
                {isSimulatingWave ? "RUNNING" : "OFF"}
              </span>
            </button>
          </div>

          {/* Elevation Exaggeration Slider */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-slate-400" />
                DEM Vertical Exaggeration:
              </span>
              <span className="text-slate-200 font-bold">
                {exaggeration.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={exaggeration}
              onChange={(e) =>
                setTerrainControl("exaggeration", parseFloat(e.target.value))
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Auto-rotate Toggle */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-cyan-400" />
              Auto-Rotate Idle:
            </span>
            <button
              onClick={() => setTerrainControl("autoRotate", !autoRotate)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                autoRotate
                  ? "bg-cyan-500/20 border-cyan-400/30 text-cyan-neon"
                  : "bg-slate-800 border-white/10 text-slate-400"
              }`}
            >
              {autoRotate ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Raycast Hover HUD Probe (Top Center) */}
      {probedPoint && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="glass-panel px-4 py-2 rounded-xl border border-cyan-400/40 shadow-cyan-glow flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-neon animate-ping" />
              <span className="text-slate-400">SURFACE ELEV:</span>
              <span className="text-slate-100 font-bold">
                {probedPoint.elevation} m
              </span>
            </div>
            <div className="w-px h-3.5 bg-white/20" />
            <div>
              <span className="text-slate-400">WATER COLUMN: </span>
              <span
                className={`font-bold ${
                  probedPoint.depth > 0 ? "text-cyan-neon" : "text-slate-400"
                }`}
              >
                {probedPoint.depth > 0 ? `${probedPoint.depth} m` : "DRY"}
              </span>
            </div>
            <div className="w-px h-3.5 bg-white/20" />
            <div>
              <span className="text-slate-400">HAZARD: </span>
              <span
                className={`font-bold ${
                  probedPoint.risk === "Critical"
                    ? "text-red-400"
                    : probedPoint.risk === "High"
                    ? "text-amber-400"
                    : probedPoint.risk === "Moderate"
                    ? "text-blue-400"
                    : probedPoint.risk === "Low"
                    ? "text-cyan-300"
                    : "text-emerald-400"
                }`}
              >
                {probedPoint.risk.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left Corner Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
        <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30 max-w-xs shadow-cyan-glow">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Hydraulic Inundation Legend</span>
            <span className="text-cyan-neon font-bold">PINN Bathymetry</span>
          </div>

          {/* Continuous Depth Color Bar */}
          <div className="space-y-1 mb-2.5">
            <div className="h-3 w-full rounded-md bg-gradient-to-r from-[#06b6d4] via-[#0284c7] via-[#f59e0b] to-[#ef4444]" />
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>0.1m</span>
              <span>1.0m</span>
              <span>2.5m</span>
              <span>4.5m+</span>
            </div>
          </div>

          {/* Risk Badges */}
          <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
            <div className="py-1 px-1 rounded bg-[#06b6d4]/20 border border-[#06b6d4]/40 text-[#06b6d4]">
              Shallow
            </div>
            <div className="py-1 px-1 rounded bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-[#3b82f6]">
              Moderate
            </div>
            <div className="py-1 px-1 rounded bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b]">
              High
            </div>
            <div className="py-1 px-1 rounded bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444]">
              Critical
            </div>
          </div>

          {/* Touch instruction hint */}
          <div className="mt-2.5 pt-2 border-t border-white/10 text-[9px] font-mono text-slate-400 text-center">
            DRAG TO ROTATE &bull; PINCH/SCROLL TO ZOOM &bull; HOVER TO PROBE
          </div>
        </div>
      </div>

      {/* Bottom Right Floating Badge */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:block">
        <div className="px-3 py-1.5 rounded-lg bg-space-950/70 border border-white/10 text-[10px] font-mono text-slate-400 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon animate-pulse" />
          <span>60 FPS R3F &bull; ADAPTIVE DPR &bull; MANNING-PINN</span>
        </div>
      </div>
    </div>
  );
};
