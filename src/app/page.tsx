"use client";

import React, { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { GlobeTooltip } from "@/components/globe/GlobeTooltip";
import { EventDetailModal } from "@/components/modals/EventDetailModal";
import { ModelInfoModal } from "@/components/modals/ModelInfoModal";
import { UploadFlow } from "@/components/upload/UploadFlow";
import { AnalysisDashboard } from "@/components/analysis/AnalysisDashboard";
import { CrossSectionProfile } from "@/components/terrain/CrossSectionProfile";
import { ModelSpecsView } from "@/components/modelspecs/ModelSpecsView";
import { ReportsView } from "@/components/reports/ReportsView";
import { ProfileView } from "@/components/profile/ProfileView";
import { SettingsView } from "@/components/settings/SettingsView";
import { useFloodStore } from "@/store/useFloodStore";
import { useAuthStore } from "@/store/useAuthStore";
import { FLOOD_EVENTS } from "@/data/floodEvents";
import {
  Satellite,
  Compass,
  Loader2,
  ChevronRight,
} from "lucide-react";

// Dynamic imports with ssr: false for 3D WebGL scenes to guarantee fast FCP & no SSR issues
const GlobeScene = dynamic(
  () => import("@/components/globe/GlobeScene").then((m) => m.GlobeScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] bg-space-950 flex flex-col items-center justify-center text-cyan-400 font-mono">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-neon" />
        <span className="text-xs tracking-widest uppercase">Initializing 3D Earth Globe...</span>
      </div>
    ),
  }
);

const TerrainViewer = dynamic(
  () => import("@/components/terrain/TerrainViewer").then((m) => m.TerrainViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[680px] bg-space-950 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center text-cyan-400 font-mono">
        <Loader2 className="w-10 h-10 animate-spin mb-3 text-cyan-neon" />
        <span className="text-xs tracking-widest uppercase">
          Synthesizing 3D Hydrodynamic DEM Mesh...
        </span>
      </div>
    ),
  }
);

const transitionConfig = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function HomePage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const {
    activeTab,
    setActiveTab,
    selectedEvent,
    setSelectedEvent,
    loadEventToTerrain,
  } = useFloodStore();

  const { isAuthenticated, isAuthReady, initializeAuth } = useAuthStore();

  useEffect(() => {
    setHasMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (hasMounted && isAuthReady && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hasMounted, isAuthReady, isAuthenticated, router]);

  // If not yet mounted or unauthenticated, block dashboard view and show redirect status
  if (!hasMounted || !isAuthReady || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-space-950 flex flex-col items-center justify-center text-cyan-400 font-mono space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-neon" />
        <span className="text-xs uppercase tracking-widest text-slate-400">
          Verifying satellite mission authorization credentials...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-neon">
      {/* Correction 1: Persistent Left Navigation Sidebar (56-72px collapsed, 240px expanded) */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Shell Content shifted by Sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          collapsed ? "pl-[68px]" : "pl-[240px]"
        }`}
      >
        {/* Correction 1: Thin 56px Top Bar */}
        <TopBar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Sub-header / Catchment Telemetry Bar (Visible across GIS & Analytics tabs) */}
          {["globe", "terrain", "pipeline", "analysis"].includes(activeTab) && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-cyan-500/20">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-neon shadow-cyan-glow">
                  <Satellite className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-heading font-bold text-sm tracking-wide text-slate-100">
                      Target Catchment: {selectedEvent.country} ({selectedEvent.region})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {selectedEvent.severity}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    SAR Pass: {selectedEvent.peakDate} &bull; Sentinel-1 C-SAR Dual-Pol &bull; Copernicus DEM 30m
                  </p>
                </div>
              </div>

              {/* Quick tab switcher pill for fast workflow switching */}
              <div className="flex items-center space-x-1 p-1 bg-space-900 rounded-xl border border-white/5 self-start md:self-auto overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveTab("globe")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    activeTab === "globe"
                      ? "bg-cyan-500/20 text-cyan-neon border border-cyan-400/30 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  1. 3D Globe
                </button>
                <button
                  onClick={() => setActiveTab("terrain")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    activeTab === "terrain"
                      ? "bg-cyan-500/20 text-cyan-neon border border-cyan-400/30 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  2. 3D Terrain
                </button>
                <button
                  onClick={() => setActiveTab("pipeline")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    activeTab === "pipeline"
                      ? "bg-cyan-500/20 text-cyan-neon border border-cyan-400/30 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  3. Ingestion Pipeline
                </button>
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    activeTab === "analysis"
                      ? "bg-cyan-500/20 text-cyan-neon border border-cyan-400/30 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  4. Analytics
                </button>
              </div>
            </div>
          )}

          {/* Tab Views Animated with Framer Motion (ease: [0.16, 1, 0.3, 1]) */}
          <AnimatePresence mode="wait">
            {/* View 1: 3D Global Monitor */}
            {activeTab === "globe" && (
              <motion.div
                key="globe-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
                className="space-y-6"
              >
                {/* 3D Globe Card */}
                <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-cyan-glow-lg bg-space-950">
                  {/* Globe HUD Banner */}
                  <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    <div className="glass-panel px-4 py-2.5 rounded-xl border border-cyan-500/30 max-w-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-neon animate-ping" />
                        <span className="font-heading font-bold text-sm text-slate-100">
                          Global Inundation Sentinel
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                        8 Critical Sentinel-1 Flood Observatories
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        HOVER MARKER FOR STATS &bull; CLICK TO INSPECT HYDROLOGY
                      </p>
                    </div>
                  </div>

                  {/* 3D Scene */}
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex flex-col items-center justify-center text-cyan-400 font-mono text-xs">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-neon" />
                        <span>Loading NASA Blue Marble Globe...</span>
                      </div>
                    }
                  >
                    <GlobeScene />
                  </Suspense>

                  {/* Bottom quick indicator */}
                  <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:block">
                    <div className="glass-panel px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center space-x-2 border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-neon animate-pulse" />
                      <span>NASA BLUE MARBLE &bull; 60 FPS ORBITCONTROLS</span>
                    </div>
                  </div>
                </div>

                {/* 8 Benchmark Flood Observatories Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-cyan-neon" />
                      Active Satellite Flood Event Observatories (8 Global Sites)
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      Select to load into 3D Terrain Viewer
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {FLOOD_EVENTS.map((event) => {
                      const isSelected = selectedEvent.id === event.id;
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-cyan-950/60 border-cyan-400 shadow-cyan-glow"
                              : "bg-space-900/60 hover:bg-space-850 border-white/5 hover:border-cyan-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-heading font-bold text-sm text-slate-100">
                              {event.country}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
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

                          <div className="text-xs text-slate-300 font-sans line-clamp-1">
                            {event.region}
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">
                              {event.eventCount} passes
                            </span>
                            <span className="text-cyan-neon font-bold">
                              {event.pinnMaxDepthM}m peak
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              loadEventToTerrain(event);
                            }}
                            className="mt-2.5 w-full py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-semibold flex items-center justify-center space-x-1 transition-all"
                          >
                            <span>Open 3D Terrain</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* View 2: 3D Terrain Bathymetry Viewer (THE HERO FEATURE) */}
            {activeTab === "terrain" && (
              <motion.div
                key="terrain-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-slate-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-neon animate-pulse" />
                      3D Hydrodynamic DEM Bathymetry Viewer
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      High-Resolution DEM displaced mesh &bull; Semi-transparent animated water plane &bull; Manning Navier-Stokes PINN depth
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab("pipeline")}
                      className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <span>Run Custom GeoTIFF Pipeline</span>
                    </button>
                  </div>
                </div>

                {/* Hero 3D Terrain Scene Component */}
                <Suspense
                  fallback={
                    <div className="w-full h-[680px] bg-space-950 rounded-2xl flex items-center justify-center text-cyan-400 font-mono text-xs">
                      Loading 3D Terrain Mesh...
                    </div>
                  }
                >
                  <TerrainViewer />
                </Suspense>

                {/* Bathymetric Transect Cross-Section */}
                <CrossSectionProfile />
              </motion.div>
            )}

            {/* View 3: SAR Ingestion Pipeline */}
            {activeTab === "pipeline" && (
              <motion.div
                key="pipeline-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
              >
                <UploadFlow />
              </motion.div>
            )}

            {/* View 4: Risk & Hydrology Analytics */}
            {activeTab === "analysis" && (
              <motion.div
                key="analysis-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
              >
                <AnalysisDashboard />
              </motion.div>
            )}

            {/* View 5: Model Specs */}
            {activeTab === "modelspecs" && (
              <motion.div
                key="modelspecs-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
              >
                <ModelSpecsView />
              </motion.div>
            )}

            {/* View 6: Reports & 10-Page PDF Export */}
            {activeTab === "reports" && (
              <motion.div
                key="reports-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
              >
                <ReportsView />
              </motion.div>
            )}

            {/* View 7: Profile */}
            {activeTab === "profile" && (
              <motion.div
                key="profile-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
              >
                <ProfileView />
              </motion.div>
            )}

            {/* View 8: Settings */}
            {activeTab === "settings" && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={transitionConfig}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Institutional Footer */}
        <footer className="mt-auto border-t border-cyan-500/20 bg-space-950 py-6 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-neon" />
              <span className="text-slate-300 font-bold tracking-wider">
                FLOOD INTELLIGENCE
              </span>
              <span className="text-slate-500">&bull; Physics-Informed Satellite Flood Mapping</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Sentinel-1 C-SAR Dual-Pol &bull; Copernicus DEM GLO-30 &bull; U-Net++ ResNet-34 &bull; PINN Saint-Venant Depth
            </div>
          </div>
        </footer>
      </div>

      {/* Global Interactive Modals and Tooltips */}
      <GlobeTooltip />
      <EventDetailModal />
      <ModelInfoModal />
    </div>
  );
}
