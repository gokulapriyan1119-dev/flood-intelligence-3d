"use client";

import React from "react";
import { useFloodStore } from "@/store/useFloodStore";
import { ActiveTab } from "@/types/flood";
import {
  Globe,
  Mountain,
  Layers,
  BarChart3,
  Satellite,
  Info,
  Radio,
} from "lucide-react";

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setModelInfoModalOpen } = useFloodStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "globe",
      label: "3D Global Monitor",
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: "terrain",
      label: "3D Terrain Bathymetry",
      icon: <Mountain className="w-4 h-4" />,
    },
    {
      id: "pipeline",
      label: "SAR Ingestion Pipeline",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: "analysis",
      label: "Risk & Hydrology Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-space-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-neon shadow-cyan-glow">
            <Satellite className="w-5 h-5 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-neon animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-lg tracking-wider text-slate-100">
                FLOOD <span className="text-cyan-neon">INTELLIGENCE</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                SATELLITE 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              U-Net++ (IoU 0.62) &bull; Hydrodynamic PINN &bull; Sentinel-1 SAR
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-space-900/80 p-1 rounded-xl border border-white/5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-cyan-neon bg-cyan-500/15 shadow-[0_0_15px_rgba(0,240,255,0.25)] border border-cyan-400/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action: Model Architecture Modal trigger & Telemetry status */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>SENTINEL-1 C-BAND SAR ACTIVE</span>
          </div>

          <button
            onClick={() => setModelInfoModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-all shadow-sm hover:shadow-cyan-glow"
            title="Inspect Deep Learning & Physics-Informed Architecture"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Model Specs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
