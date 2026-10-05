"use client";

import React from "react";
import { Cpu, Binary, Gauge, Zap, ShieldCheck } from "lucide-react";

export const ModelSpecsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-slate-100 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-neon" />
            Model Specifications &amp; Hydrodynamic PDE Architecture
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            U-Net++ (ResNet-34 Backbone, Test IoU 0.62) &bull; Physics-Informed Neural Network (Manning-Strickler)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-neon border border-cyan-400/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>WEIGHTS BENCHMARK VERIFIED</span>
          </span>
        </div>
      </div>

      {/* Grid of Model Architecture Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model 1: U-Net++ */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
              <Binary className="w-5 h-5 text-cyan-neon" />
              1. U-Net++ (ResNet-34 Encoder)
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-400/30">
              Test IoU: 0.621
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Trained on multi-temporal Sentinel-1 C-band SAR Ground Range Detected (GRD) IW data. Uses dense nested skip pathways between the ResNet-34 encoder and decoder nodes, reducing the semantic gap between feature maps before fusion.
          </p>

          <div className="p-3.5 rounded-xl bg-space-950/80 border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Encoder Backbone:</span>
              <span className="text-slate-200">ResNet-34 (ImageNet-1K Pretrained)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Parameters:</span>
              <span className="text-cyan-neon font-bold">24,185,420 learnable weights</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Loss Formulation:</span>
              <span className="text-slate-200">L_total = 0.5 * L_BCE + 0.5 * L_Dice</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Supervision Strategy:</span>
              <span className="text-slate-200">Deep Supervision with multi-scale heads</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SAR Polarization Input:</span>
              <span className="text-cyan-400">2 Channels (VV dB + VH dB)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-cyan-neon font-bold">0.842</div>
              <div className="text-[10px] text-slate-400">Precision</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-cyan-neon font-bold">0.791</div>
              <div className="text-[10px] text-slate-400">Recall</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-emerald-400 font-bold">0.815</div>
              <div className="text-[10px] text-slate-400">F1-Score</div>
            </div>
          </div>
        </div>

        {/* Model 2: Hydrodynamic PINN */}
        <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-400" />
              2. Hydrodynamic Depth PINN
            </span>
            <span className="text-xs font-mono text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-400/30">
              Navier-Stokes Constrained
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            To prevent physically impossible water depth hallucinations, the PINN embeds the 2D Saint-Venant shallow water equations and the Manning hydraulic flow resistance into its neural loss function.
          </p>

          <div className="p-3.5 rounded-xl bg-space-950/80 border border-white/5 font-mono text-xs text-cyan-neon space-y-1 overflow-x-auto">
            <div className="text-[10px] text-slate-400 uppercase">PINN PDE Loss Objective:</div>
            <div>{"L_pinn = L_gauge + λ_mass * ||∂h/∂t + ∇·(hu) - R||²"}</div>
            <div>{"       + λ_manning * ||u - (1/n) * h^(2/3) * S_0^(1/2)||²"}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950/80 border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Roughness Coefficient (n):</span>
              <span className="text-slate-200">0.035 s/m^(1/3) (Alluvial plain)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hydrodynamic Residual:</span>
              <span className="text-emerald-400 font-bold">&lt; 4.18 × 10⁻⁵</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Terrain Conditioning:</span>
              <span className="text-slate-200">Copernicus GLO-30 DEM (30m)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Precipitation Forcing:</span>
              <span className="text-amber-400">ECMWF ERA5 Total Precipitation</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-blue-400 font-bold">4.62 m</div>
              <div className="text-[10px] text-slate-400">Peak Inundation</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-blue-400 font-bold">1.84 m</div>
              <div className="text-[10px] text-slate-400">Mean Bathymetry</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-emerald-400 font-bold">0.892</div>
              <div className="text-[10px] text-slate-400">Gauge R² Correlation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Validation Comparison */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-neon" />
          Comparative Advantage: Empirical Neural Net vs. Hydrodynamic PINN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-space-950/60 border border-red-500/20 space-y-2">
            <span className="font-bold text-red-400 block uppercase">
              Standard Black-Box Deep Learning (Unconstrained)
            </span>
            <p className="text-slate-400 leading-relaxed font-sans">
              Violates mass conservation. Predicts water depth spikes uphill and across physical barriers. Suffers from high depth variance in training data gaps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-950/60 border border-emerald-500/30 space-y-2">
            <span className="font-bold text-emerald-400 block uppercase">
              Physics-Informed Neural Network (Ours)
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              Strictly obeys gravity, bed friction, and Saint-Venant mass conservation. Yields smooth, realistic hydraulic depth profiles calibrated directly against gauge networks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
