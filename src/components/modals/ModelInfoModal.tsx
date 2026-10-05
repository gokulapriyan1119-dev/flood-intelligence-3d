"use client";

import React from "react";
import { useFloodStore } from "@/store/useFloodStore";
import { X, Cpu, Binary, Gauge, Zap } from "lucide-react";

export const ModelInfoModal: React.FC = () => {
  const { modelInfoModalOpen, setModelInfoModalOpen } = useFloodStore();

  if (!modelInfoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-space-900 border border-cyan-500/30 rounded-2xl shadow-cyan-glow-lg overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-neon border border-cyan-400/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-100">
                Neural &amp; Hydrodynamic Architecture
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                U-Net++ (ResNet34) &bull; Physics-Informed Neural Network (PINN)
              </p>
            </div>
          </div>
          <button
            onClick={() => setModelInfoModalOpen(false)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-sans text-xs">
          {/* U-Net++ Section */}
          <div className="p-4 rounded-xl bg-space-850 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-neon flex items-center gap-1.5">
                <Binary className="w-4 h-4" />
                1. U-Net++ WITH RESNET-34 ENCODER (FLOOD EXTENT SEGMENTATION)
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                Test IoU: 0.621
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Trained on multi-temporal Sentinel-1 C-SAR Ground Range Detected (GRD) IW data. C-band microwave radar pulses (5.405 GHz) exhibit specular reflection over tranquil flood waters, creating dramatic backscatter attenuation in VV and VH polarizations (&lt; -18 dB).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="p-2 rounded bg-space-950/60 font-mono text-[11px]">
                <span className="text-slate-400 block text-[9px]">ENCODER BACKBONE</span>
                <span className="text-slate-200">ResNet-34 (ImageNet Pretrained)</span>
              </div>
              <div className="p-2 rounded bg-space-950/60 font-mono text-[11px]">
                <span className="text-slate-400 block text-[9px]">SKIP PATHWAYS</span>
                <span className="text-slate-200">Dense Nested Skip Connections</span>
              </div>
              <div className="p-2 rounded bg-space-950/60 font-mono text-[11px]">
                <span className="text-slate-400 block text-[9px]">LOSS OBJECTIVE</span>
                <span className="text-slate-200">Binary Cross-Entropy + Dice</span>
              </div>
            </div>
          </div>

          {/* PINN Section */}
          <div className="p-4 rounded-xl bg-space-850 border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                2. PHYSICS-INFORMED NEURAL NETWORK (PINN FLOOD DEPTH)
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px] border border-blue-500/30">
                Manning-Strickler Navier-Stokes
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Standard deep learning models hallucinate unrealistic water depth jumps. Our PINN constrains the output space by embedding the 2D Saint-Venant shallow water equations and the Manning hydraulic flow relation directly into the loss function:
            </p>
            <div className="p-2.5 rounded bg-space-950/90 font-mono text-cyan-neon text-center text-xs border border-white/5 overflow-x-auto">
              {"L_total = L_data + λ_mass ||∂h/∂t + ∇·(hu) - R||² + λ_manning ||u - (1/n) h^(2/3) S₀^(1/2)||²"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded bg-space-950/60">
                <span className="text-slate-400 block text-[9px]">ROUGHNESS COEFF (n)</span>
                <span className="text-slate-200">0.035 s/m^(1/3)</span>
              </div>
              <div className="p-2 rounded bg-space-950/60">
                <span className="text-slate-400 block text-[9px]">HYDRODYNAMIC RESIDUAL</span>
                <span className="text-emerald-400">&lt; 4.2 × 10⁻⁵</span>
              </div>
              <div className="p-2 rounded bg-space-950/60">
                <span className="text-slate-400 block text-[9px]">TOPOGRAPHIC INPUT</span>
                <span className="text-slate-200">Copernicus GLO-30 DEM</span>
              </div>
            </div>
          </div>

          {/* Multicriteria Risk Section */}
          <div className="p-4 rounded-xl bg-space-850 border border-amber-500/20 space-y-2">
            <span className="font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              3. MULTICRITERIA RISK ZONING &amp; ASSET OVERLAY
            </span>
            <p className="text-slate-300 leading-relaxed">
              Combines continuous water depth h from the PINN with estimated velocity u and high-resolution OpenStreetMap critical infrastructure layers. Produces standardized hazard classifications (Low, Moderate, High, Critical) informing immediate search &amp; rescue deployments and levee reinforcements.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-space-950/60 flex justify-end">
          <button
            onClick={() => setModelInfoModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-semibold"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
