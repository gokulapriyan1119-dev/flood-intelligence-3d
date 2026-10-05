"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useFloodStore } from "@/store/useFloodStore";
import { downloadGeoTiff } from "@/utils/geoExport";
import { generate10PagePdfReport } from "@/utils/pdfReportGenerator";
import {
  FileText,
  Download,
  Calendar,
  Sparkles,
  FileCheck,
} from "lucide-react";

export const ReportsView: React.FC = () => {
  const { analysisResults, fileMetadata, selectedEvent } = useFloodStore();
  const [isExporting, setIsExporting] = useState(false);

  const handle10PageExport = () => {
    if (!analysisResults) {
      toast.error("Analysis data not ready. Please run pipeline first.");
      return;
    }
    setIsExporting(true);
    toast.loading("Compiling 10-Page Scientific Flood Intelligence Report...");
    setTimeout(() => {
      try {
        generate10PagePdfReport(analysisResults, fileMetadata, selectedEvent);
        setIsExporting(false);
        toast.dismiss();
        toast.success("10-Page PDF Report successfully downloaded!");
      } catch (e: unknown) {
        setIsExporting(false);
        toast.dismiss();
        const msg = e instanceof Error ? e.message : "Unknown error";
        toast.error(`Export failed: ${msg}`);
      }
    }, 600);
  };

  const handleTiffDownload = (filename: "probability.tif" | "depth.tif" | "risk.tif") => {
    downloadGeoTiff(filename);
    toast.success(`Downloaded ${filename}`);
  };

  const archiveReports = [
    {
      id: "REP-2024-09",
      basin: "Pakistan Indus Basin (Sindh Flood)",
      date: "2024-09-15 00:00 UTC",
      extent: "78,400 km²",
      severity: "Catastrophic",
      pages: 10,
    },
    {
      id: "REP-2024-06",
      basin: "Assam Brahmaputra River Basin",
      date: "2024-06-22 00:00 UTC",
      extent: "34,500 km²",
      severity: "Catastrophic",
      pages: 10,
    },
    {
      id: "REP-2024-05",
      basin: "Kelani Ganga Floodplain (Colombo)",
      date: "2024-05-30 00:00 UTC",
      extent: "2,800 km²",
      severity: "Moderate",
      pages: 10,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-neon" />
            Disaster Situation Reports &amp; 10-Page PDF Export
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Institutional emergency briefings formatted to Copernicus EMS and GDACS standards.
          </p>
        </div>

        <button
          onClick={handle10PageExport}
          disabled={isExporting}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-mono text-xs font-bold flex items-center gap-2 shadow-cyan-glow transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isExporting ? "Compiling PDF..." : "Export 10-Page PDF"}</span>
        </button>
      </div>

      {/* Featured Current Scene Report Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-cyan-neon" />
            <h3 className="font-heading font-bold text-base text-slate-100">
              Active Assessment: {selectedEvent.country} ({selectedEvent.region})
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded border border-cyan-400/30 self-start sm:self-auto">
            Ready for Comprehensive 10-Page Export
          </span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Generates an institutional 10-page document including: Executive Summary, Sentinel-1 Radar Physics, PINN Bathymetry Depth Distribution, Multi-Criteria Hazard Matrix, U-Net++ ResNet-34 Validation Metrics, Saint-Venant Loss Formulations, ERA5 Rainfall Forcing, Hydrograph Simulation, and Technical Appendix.
        </p>

        {/* Deliverables Row */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handle10PageExport}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-neon border border-cyan-400/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-cyan-glow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full 10-Page Report (PDF)</span>
          </button>

          <button
            onClick={() => handleTiffDownload("probability.tif")}
            className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>probability.tif (GeoTIFF)</span>
          </button>

          <button
            onClick={() => handleTiffDownload("depth.tif")}
            className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-blue-500/30 text-xs font-mono text-blue-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>depth.tif (32-Bit Float)</span>
          </button>

          <button
            onClick={() => handleTiffDownload("risk.tif")}
            className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>risk.tif (Hazard Zoning)</span>
          </button>
        </div>
      </div>

      {/* Historical Report Archive Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-neon" />
          Historical Flood Observatory Situation Archive
        </h3>

        <div className="divide-y divide-white/5 font-mono text-xs">
          {archiveReports.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 px-2 rounded-xl transition-colors"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">{item.basin}</span>
                  <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                    {item.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ID: {item.id} &bull; Date: {item.date} &bull; Peak: {item.extent}
                </div>
              </div>

              <button
                onClick={handle10PageExport}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-neon border border-white/10 text-[11px] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Export {item.pages}-Page PDF</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
