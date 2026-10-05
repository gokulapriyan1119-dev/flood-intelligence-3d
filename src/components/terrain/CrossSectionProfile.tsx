"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useFloodStore } from "@/store/useFloodStore";
import { Activity, ShieldAlert, Droplet } from "lucide-react";

export const CrossSectionProfile: React.FC = () => {
  const { terrainControls, selectedEvent } = useFloodStore();
  const { waterLevel, exaggeration } = terrainControls;

  // Generate synthetic river transect cross-section
  const transectData = useMemo(() => {
    const points = [];
    const count = 41;
    for (let i = 0; i < count; i++) {
      const distKm = Number(((i / (count - 1)) * 18).toFixed(1));
      const normalizedX = (distKm - 9) / 6.0;

      // Valley profile
      const valley = Math.pow(Math.abs(normalizedX), 1.6) * 1.4;
      let elev = valley;

      // Riverbed channel in the center (8.0 to 10.0 km)
      const distToRiverCenter = Math.abs(distKm - 9.0);
      if (distToRiverCenter < 1.4) {
        elev -= (1.4 - distToRiverCenter) * 0.7;
      }
      elev = Math.max(-0.6, elev) * exaggeration;

      // Levees at 7.2km and 10.8km
      if (
        (distKm >= 7.0 && distKm <= 7.4) ||
        (distKm >= 10.6 && distKm <= 11.0)
      ) {
        elev += 0.45 * exaggeration;
      }

      const waterElevation = waterLevel * exaggeration;
      const isSubmerged = waterElevation > elev;
      const waterSurface = isSubmerged ? waterElevation : elev;
      const waterDepth = isSubmerged ? (waterElevation - elev) / exaggeration : 0;

      points.push({
        distKm: `${distKm} km`,
        terrainElev: Number(elev.toFixed(2)),
        waterSurface: Number(waterSurface.toFixed(2)),
        waterDepth: Number(waterDepth.toFixed(2)),
        isSubmerged,
      });
    }
    return points;
  }, [waterLevel, exaggeration]);



  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-neon" />
          <h3 className="font-heading font-bold text-sm text-slate-100">
            Hydraulic Bathymetry Cross-Section Transect (A &mdash; A&prime;)
          </h3>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1 text-cyan-neon">
            <Droplet className="w-3.5 h-3.5" />
            Water Surface Elevation: {(waterLevel * exaggeration).toFixed(2)}m ASL
          </span>
          <span>&bull;</span>
          <span className="text-slate-300">Basin: {selectedEvent.country}</span>
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={transectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="terrainFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3d3322" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1a382b" stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="distKm" stroke="#64748b" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={4} />
            <YAxis stroke="#64748b" tick={{ fontSize: 9, fill: "#94a3b8" }} unit="m" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#050B14",
                border: "1px solid rgba(0, 240, 255, 0.4)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "#f8fafc",
                fontFamily: "monospace",
              }}
            />

            {/* Terrain Ground Bed */}
            <Area
              type="monotone"
              dataKey="terrainElev"
              stroke="#854d0e"
              strokeWidth={2}
              fill="url(#terrainFill)"
              name="Terrain Bed"
            />

            {/* Inundated Water Column Overlay */}
            <Area
              type="monotone"
              dataKey="waterSurface"
              stroke="#00F0FF"
              strokeWidth={2}
              fill="url(#waterFill)"
              name="Water Surface"
            />

            <ReferenceLine
              y={waterLevel * exaggeration}
              stroke="#00F0FF"
              strokeDasharray="4 4"
              label={{
                value: "WSE Peak",
                fill: "#00F0FF",
                fontSize: 9,
                position: "insideTopRight",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#854d0e]" />
            Copernicus DEM 30m Bed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-neon" />
            PINN Water Column Depth
          </span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Levee Overtopping Alert at &gt;3.2m stage</span>
        </div>
      </div>
    </div>
  );
};
