"use client";

import React from "react";
import { useFloodStore } from "@/store/useFloodStore";
import { formatArea, formatNumber, formatCoords } from "@/utils/formatters";
import {
  X,
  Satellite,
  Waves,
  Users,
  Compass,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

export const EventDetailModal: React.FC = () => {
  const { modalEvent, setModalEvent, loadEventToTerrain, setActiveTab } =
    useFloodStore();

  if (!modalEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-space-900 border border-cyan-500/30 rounded-2xl shadow-cyan-glow-lg overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-cyan-300 to-blue-600" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="font-heading font-bold text-2xl text-slate-100">
                {modalEvent.country}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold tracking-wider ${
                  modalEvent.severity === "Catastrophic"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : modalEvent.severity === "Severe"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                }`}
              >
                {modalEvent.severity} Inundation
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              {modalEvent.region} &bull; {formatCoords(modalEvent.lat, modalEvent.lon)}
            </p>
          </div>

          <button
            onClick={() => setModalEvent(null)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Executive Description */}
          <div className="p-3.5 rounded-xl bg-space-850 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-cyan-neon uppercase tracking-wider block mb-1 font-mono text-[10px]">
              Hydrological Event Brief
            </span>
            {modalEvent.description}
          </div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-space-950/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Peak Flooded Area
              </div>
              <div className="text-lg font-bold font-mono text-cyan-300 mt-1 flex items-center gap-1">
                <Waves className="w-4 h-4 text-cyan-neon" />
                {formatArea(modalEvent.peakExtentKm2)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-space-950/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Water Volume
              </div>
              <div className="text-lg font-bold font-mono text-slate-200 mt-1">
                {modalEvent.inundationVolumeKm3} km³
              </div>
            </div>

            <div className="p-3 rounded-xl bg-space-950/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Population Exposed
              </div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1 flex items-center gap-1">
                <Users className="w-4 h-4" />
                {formatNumber(modalEvent.populationExposed)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-space-950/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Historical SAR Events
              </div>
              <div className="text-lg font-bold font-mono text-cyan-neon mt-1">
                {modalEvent.eventCount} passes
              </div>
            </div>
          </div>

          {/* Earth Observation & Deep Learning Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EO Data */}
            <div className="p-4 rounded-xl bg-space-850/80 border border-cyan-500/20">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 font-semibold mb-3">
                <Satellite className="w-4 h-4 text-cyan-neon" />
                <span>OBSERVATION &amp; FORCING INPUTS</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sensor:</span>
                  <span className="text-slate-200">{modalEvent.sarSensor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Polarization:</span>
                  <span className="text-cyan-400">{modalEvent.polarization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DEM Model:</span>
                  <span className="text-slate-200">{modalEvent.demSource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ERA5 24h Rain:</span>
                  <span className="text-amber-300 font-bold">{modalEvent.rainfall24hMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Acquisition:</span>
                  <span className="text-slate-300">{modalEvent.peakDate}</span>
                </div>
              </div>
            </div>

            {/* DL Models */}
            <div className="p-4 rounded-xl bg-space-850/80 border border-cyan-500/20">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 font-semibold mb-3">
                <Cpu className="w-4 h-4 text-cyan-neon" />
                <span>MODEL INFERENCE OUTPUTS</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">U-Net++ Test IoU:</span>
                  <span className="text-cyan-neon font-bold">{modalEvent.unetPlusIoU.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Architecture:</span>
                  <span className="text-slate-200">ResNet34 + Deep Supervision</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PINN Peak Depth:</span>
                  <span className="text-red-400 font-bold">{modalEvent.pinnMaxDepthM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PINN Mean Depth:</span>
                  <span className="text-cyan-300">{modalEvent.pinnMeanDepthM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hydro Solver:</span>
                  <span className="text-slate-300">Manning Navier-Stokes PINN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Breakdown */}
          <div className="p-3.5 rounded-xl bg-space-950/70 border border-white/5">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-2">
              Critical Assets Within Flood Inundation Zone
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xs text-red-400 font-bold font-mono">
                  {modalEvent.infrastructureImpact.hospitals}
                </div>
                <div className="text-[10px] text-slate-400">Hospitals</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xs text-amber-400 font-bold font-mono">
                  {modalEvent.infrastructureImpact.substations}
                </div>
                <div className="text-[10px] text-slate-400">Substations</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xs text-cyan-300 font-bold font-mono">
                  {formatNumber(modalEvent.infrastructureImpact.roadsKm)} km
                </div>
                <div className="text-[10px] text-slate-400">Roads</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xs text-slate-200 font-bold font-mono">
                  {formatNumber(modalEvent.infrastructureImpact.schools)}
                </div>
                <div className="text-[10px] text-slate-400">Schools</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-white/10 bg-space-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              setModalEvent(null);
              setActiveTab("pipeline");
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-mono flex items-center justify-center space-x-2 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Ingest SAR GeoTIFF in Pipeline</span>
          </button>

          <button
            onClick={() => loadEventToTerrain(modalEvent)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all shadow-cyan-glow hover:shadow-cyan-glow-lg"
          >
            <span>Open in 3D Terrain Viewer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
