"use client";

import React from "react";
import { useFloodStore } from "@/store/useFloodStore";
import { formatArea } from "@/utils/formatters";
import { AlertTriangle, Waves } from "lucide-react";

export const GlobeTooltip: React.FC = () => {
  const { tooltipEvent } = useFloodStore();

  if (!tooltipEvent) return null;

  const { event, x, y } = tooltipEvent;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: `${x + 16}px`,
        top: `${y - 20}px`,
      }}
    >
      <div className="glass-panel px-3.5 py-2.5 rounded-xl border border-cyan-400/40 shadow-cyan-glow-lg text-slate-100 min-w-[200px]">
        <div className="flex items-center justify-between space-x-2">
          <span className="font-heading font-bold text-sm text-cyan-neon tracking-wide">
            {event.country}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
              event.severity === "Catastrophic"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : event.severity === "Severe"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            }`}
          >
            {event.severity}
          </span>
        </div>

        <div className="mt-1 text-xs text-slate-300 font-sans">
          {event.region}
        </div>

        <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
              Recorded Events
            </span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-cyan-neon" />
              {event.eventCount} historical
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
              Peak Extent
            </span>
            <span className="text-slate-200 font-bold flex items-center gap-1">
              <Waves className="w-3 h-3 text-cyan-400" />
              {formatArea(event.peakExtentKm2)}
            </span>
          </div>
        </div>

        <div className="mt-2 text-[9px] text-cyan-400/80 font-mono text-center tracking-wider">
          CLICK MARKER TO INSPECT HYDROLOGY
        </div>
      </div>
    </div>
  );
};
