"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useFloodStore } from "@/store/useFloodStore";
import { downloadGeoTiff, generatePdfReport } from "@/utils/geoExport";
import { formatNumber } from "@/utils/formatters";
import {
  BarChart3,
  Waves,
  Activity,
  ShieldAlert,
  Building2,
  Download,
  FileText,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export const AnalysisDashboard: React.FC = () => {
  const { analysisResults, fileMetadata, selectedEvent, setActiveTab } =
    useFloodStore();

  if (!analysisResults) return null;

  const customTooltipStyle = {
    backgroundColor: "#050B14",
    border: "1px solid rgba(0, 240, 255, 0.3)",
    borderRadius: "10px",
    fontSize: "11px",
    fontFamily: "var(--font-inter), monospace",
    color: "#f8fafc",
    boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-heading font-bold text-2xl text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-neon" />
              Hydrological Intelligence &amp; Risk Analytics
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Catchment Basin: {selectedEvent.region} &bull; Synthetic PINN Simulation &amp; U-Net++ Validation
          </p>
        </div>

        {/* Quick Report Download */}
        <button
          onClick={() => generatePdfReport(analysisResults, fileMetadata)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 text-xs font-mono font-bold flex items-center gap-2 shadow-cyan-glow transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Export Full PDF Report</span>
        </button>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 shadow-cyan-glow">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Total Inundation Extent
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-neon mt-1">
            {analysisResults.floodedAreaKm2.toFixed(1)} km²
          </div>
          <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            Peak reached at T0
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-blue-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Max Hydrodynamic Depth
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {analysisResults.peakDepthMeters.toFixed(2)} m
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Mean: {analysisResults.meanDepthMeters.toFixed(2)} m
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Exposed Inhabitants
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {formatNumber(analysisResults.populationAtRisk)}
          </div>
          <div className="text-[10px] font-mono text-amber-300 mt-1">
            18 vulnerable sectors
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            U-Net++ ResNet34 IoU
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {analysisResults.unetPlusIoU.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-emerald-300 mt-1">
            High SAR confidence
          </div>
        </div>
      </div>

      {/* Grid of 4 Recharts visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Hydrograph Timeline (Pre-peak to Recession) */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-neon" />
              Hydrograph Simulation (Discharge vs. Water Level)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              PINN Flow Dynamic
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysisResults.hydrograph}>
                <defs>
                  <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeHour" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis yAxisId="left" stroke="#00F0FF" tick={{ fontSize: 10, fill: "#00F0FF" }} unit="m" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" m³/s" />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="waterLevelM"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#waterLevelGrad)"
                  name="Water Level (m)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Simulates dynamic river stage surge peaking at T0 (4.62m) followed by exponential drainage recession.
          </p>
        </div>

        {/* Chart 2: Inundation Depth Area Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              Inundated Area vs. Depth Class (km²)
            </span>
            <span className="text-[10px] font-mono text-blue-400">
              Copernicus DEM 30m
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisResults.depthDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="depthRange" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" km²" />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="areaKm2" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Area (km²)">
                  {analysisResults.depthDistribution.map((entry, index) => {
                    const colors = ["#06b6d4", "#3b82f6", "#f59e0b", "#ef4444"];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Shallow (0-0.5m) and moderate (0.5-1.5m) inundations account for &gt;66% of the flooded footprint.
          </p>
        </div>

        {/* Chart 3: SAR Backscatter Polarization Profile (VV vs. VH) */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-neon" />
              SAR Backscatter Signature (Water vs. Dry Terrain)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              C-Band Radar dB
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisResults.backscatterProfile}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dbBin" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="waterCount" name="Water Pixels" fill="#00F0FF" radius={[3, 3, 0, 0]} />
                <Bar dataKey="dryCount" name="Dry Ground Pixels" fill="#64748b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Specular reflection from smooth flood water causes dramatic radar signal drop (&lt; -18 dB).
          </p>
        </div>

        {/* Chart 4: Catchment Risk Zoning Donut Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Catchment Risk Classification Distribution
            </span>
            <span className="text-[10px] font-mono text-amber-300">
              Hazard Zoning
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysisResults.riskBreakdown}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {analysisResults.riskBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#050B14" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            5% of catchment area is in Critical hazard zone requiring prioritized emergency evacuation.
          </p>
        </div>
      </div>

      {/* Critical Infrastructure Exposure Table */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-sm text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-neon" />
            Critical Infrastructure Exposure Matrix (OpenStreetMap Intersect)
          </span>
          <button
            onClick={() => setActiveTab("terrain")}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-neon flex items-center gap-1 transition-colors"
          >
            <span>Inspect In 3D Terrain</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-space-950/70 border border-red-500/30">
            <div className="text-xl font-bold font-mono text-red-400">
              {analysisResults.infrastructureExposed.hospitals}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-semibold">Hospitals Inundated</div>
            <div className="text-[10px] text-red-300 font-mono mt-0.5">Depth &gt; 0.8m</div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950/70 border border-amber-500/30">
            <div className="text-xl font-bold font-mono text-amber-400">
              {analysisResults.infrastructureExposed.substations}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-semibold">Substations Submerged</div>
            <div className="text-[10px] text-amber-300 font-mono mt-0.5">High grid blackout risk</div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950/70 border border-cyan-500/30">
            <div className="text-xl font-bold font-mono text-cyan-neon">
              {analysisResults.infrastructureExposed.roadsKm} km
            </div>
            <div className="text-xs text-slate-300 mt-1 font-semibold">Highways Impassable</div>
            <div className="text-[10px] text-cyan-400 font-mono mt-0.5">3 arterial bypasses cut</div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950/70 border border-slate-700">
            <div className="text-xl font-bold font-mono text-slate-100">
              {analysisResults.infrastructureExposed.schools}
            </div>
            <div className="text-xs text-slate-300 mt-1 font-semibold">Shelters / Schools</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Identified for relief</div>
          </div>
        </div>
      </div>

      {/* Deliverable Downloads Row */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-heading font-bold text-sm text-slate-100">
            Export Hydrological Deliverables &amp; GIS GeoTIFFs
          </div>
          <div className="text-xs font-mono text-slate-400 mt-0.5">
            Download 32-bit floating point rasters and formal hydro-intelligence briefing report.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadGeoTiff("probability.tif")}
            className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>probability.tif</span>
          </button>

          <button
            onClick={() => downloadGeoTiff("depth.tif")}
            className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-blue-500/30 text-xs font-mono text-blue-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>depth.tif</span>
          </button>

          <button
            onClick={() => downloadGeoTiff("risk.tif")}
            className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>risk.tif</span>
          </button>

          <button
            onClick={() => generatePdfReport(analysisResults, fileMetadata)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-cyan-glow transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
