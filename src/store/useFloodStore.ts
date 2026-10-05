import { create } from "zustand";
import {
  ActiveTab,
  AnalysisResults,
  FloodEvent,
  TerrainControls,
  UploadFileMetadata,
} from "@/types/flood";
import { FLOOD_EVENTS } from "@/data/floodEvents";

export type PipelineStatus =
  | "idle"
  | "uploading"
  | "preprocessing"
  | "segmenting"
  | "estimating_depth"
  | "classifying_risk"
  | "completed"
  | "error";

interface FloodState {
  activeTab: ActiveTab;
  selectedEvent: FloodEvent;
  modalEvent: FloodEvent | null;
  tooltipEvent: { event: FloodEvent; x: number; y: number } | null;
  modelInfoModalOpen: boolean;

  // Upload Pipeline
  pipelineStatus: PipelineStatus;
  currentStepIndex: number;
  pipelineProgress: number;
  pipelineLogs: string[];
  fileMetadata: UploadFileMetadata | null;
  analysisResults: AnalysisResults | null;

  // 3D Terrain controls
  terrainControls: TerrainControls;
  terrainResetTrigger: number;
  probedPoint: {
    x: number;
    z: number;
    elevation: number;
    depth: number;
    risk: "Dry" | "Low" | "Moderate" | "High" | "Critical";
  } | null;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedEvent: (event: FloodEvent) => void;
  setModalEvent: (event: FloodEvent | null) => void;
  setTooltipEvent: (
    tooltip: { event: FloodEvent; x: number; y: number } | null
  ) => void;
  setModelInfoModalOpen: (open: boolean) => void;
  setTerrainControl: <K extends keyof TerrainControls>(
    key: K,
    value: TerrainControls[K]
  ) => void;
  resetTerrainControls: () => void;
  setProbedPoint: (point: FloodState["probedPoint"]) => void;

  startPipeline: (customMeta?: Partial<UploadFileMetadata>) => Promise<void>;
  resetPipeline: () => void;
  loadEventToTerrain: (event: FloodEvent) => void;
}

const DEFAULT_TERRAIN_CONTROLS: TerrainControls = {
  showTerrain: true,
  showWater: true,
  showHeatmap: false,
  showRisk: false,
  waterLevel: 1.8,
  autoRotate: true,
  exaggeration: 1.5,
};

const DEFAULT_RESULTS: AnalysisResults = {
  floodedAreaKm2: 148.6,
  meanDepthMeters: 1.84,
  peakDepthMeters: 4.62,
  populationAtRisk: 84200,
  economicExposureUsdM: 142.5,
  unetPlusIoU: 0.62,
  infrastructureExposed: {
    hospitals: 3,
    substations: 11,
    roadsKm: 42.5,
    schools: 19,
  },
  depthDistribution: [
    { depthRange: "0.0 - 0.5m", areaKm2: 46.2, percent: 31.1 },
    { depthRange: "0.5 - 1.5m", areaKm2: 52.8, percent: 35.5 },
    { depthRange: "1.5 - 3.0m", areaKm2: 32.4, percent: 21.8 },
    { depthRange: "3.0 - 4.5m+", areaKm2: 17.2, percent: 11.6 },
  ],
  hydrograph: [
    { timeHour: "-48h", dischargeM3s: 1850, waterLevelM: 0.8 },
    { timeHour: "-36h", dischargeM3s: 2400, waterLevelM: 1.4 },
    { timeHour: "-24h", dischargeM3s: 4800, waterLevelM: 2.9 },
    { timeHour: "-12h", dischargeM3s: 7600, waterLevelM: 4.1 },
    { timeHour: "Peak (T0)", dischargeM3s: 8950, waterLevelM: 4.62 },
    { timeHour: "+12h", dischargeM3s: 7100, waterLevelM: 3.8 },
    { timeHour: "+24h", dischargeM3s: 5300, waterLevelM: 2.7 },
    { timeHour: "+36h", dischargeM3s: 3900, waterLevelM: 2.0 },
    { timeHour: "+48h", dischargeM3s: 2800, waterLevelM: 1.5 },
  ],
  riskBreakdown: [
    { category: "Safe (Dry)", value: 58, color: "#10b981" },
    { category: "Low (0-0.5m)", value: 16, color: "#06b6d4" },
    { category: "Moderate (0.5-1.5m)", value: 14, color: "#3b82f6" },
    { category: "High (1.5-3.0m)", value: 7, color: "#f59e0b" },
    { category: "Critical (>3.0m)", value: 5, color: "#ef4444" },
  ],
  backscatterProfile: [
    { dbBin: "-28 dB", waterCount: 480, dryCount: 12 },
    { dbBin: "-24 dB", waterCount: 920, dryCount: 45 },
    { dbBin: "-20 dB", waterCount: 840, dryCount: 160 },
    { dbBin: "-16 dB", waterCount: 310, dryCount: 650 },
    { dbBin: "-12 dB", waterCount: 65, dryCount: 1250 },
    { dbBin: "-8 dB", waterCount: 12, dryCount: 1890 },
    { dbBin: "-4 dB", waterCount: 2, dryCount: 940 },
  ],
};

export const useFloodStore = create<FloodState>((set) => ({
  activeTab: "globe",
  selectedEvent: FLOOD_EVENTS[0], // Pakistan Indus as benchmark default
  modalEvent: null,
  tooltipEvent: null,
  modelInfoModalOpen: false,

  pipelineStatus: "idle",
  currentStepIndex: 0,
  pipelineProgress: 0,
  pipelineLogs: [],
  fileMetadata: null,
  analysisResults: DEFAULT_RESULTS,

  terrainControls: DEFAULT_TERRAIN_CONTROLS,
  terrainResetTrigger: 0,
  probedPoint: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setModalEvent: (event) => set({ modalEvent: event }),
  setTooltipEvent: (tooltip) => set({ tooltipEvent: tooltip }),
  setModelInfoModalOpen: (open) => set({ modelInfoModalOpen: open }),

  setTerrainControl: (key, value) =>
    set((state) => ({
      terrainControls: { ...state.terrainControls, [key]: value },
    })),

  resetTerrainControls: () =>
    set((state) => ({
      terrainControls: { ...DEFAULT_TERRAIN_CONTROLS },
      terrainResetTrigger: state.terrainResetTrigger + 1,
      probedPoint: null,
    })),

  setProbedPoint: (point) => set({ probedPoint: point }),

  loadEventToTerrain: (event) => {
    set({
      selectedEvent: event,
      modalEvent: null,
      activeTab: "terrain",
      terrainControls: {
        ...DEFAULT_TERRAIN_CONTROLS,
        waterLevel: event.pinnMeanDepthM || 1.8,
      },
    });
  },

  resetPipeline: () => {
    set({
      pipelineStatus: "idle",
      currentStepIndex: 0,
      pipelineProgress: 0,
      pipelineLogs: [],
      fileMetadata: null,
    });
  },

  startPipeline: async (customMeta) => {
    const meta: UploadFileMetadata = {
      name: customMeta?.name || "S1A_IW_GRDH_1SDV_20240822T004512_055318_E39A.tif",
      sizeBytes: customMeta?.sizeBytes || 492482104,
      dimensions: customMeta?.dimensions || "2048 x 2048 px (10m GSD)",
      bands: customMeta?.bands || ["Band 1: VV (dB)", "Band 2: VH (dB)"],
      sensor: customMeta?.sensor || "Sentinel-1A C-SAR (5.405 GHz)",
      orbitDirection: customMeta?.orbitDirection || "Descending",
      acquisitionDate: customMeta?.acquisitionDate || "2024-08-22 00:45:12 UTC",
      demModel: customMeta?.demModel || "Copernicus DEM GLO-30 (30m)",
      rainfallSource: customMeta?.rainfallSource || "ECMWF ERA5 Reanalysis (0.25°)",
      centerCoords: customMeta?.centerCoords || [27.559, 68.212],
    };

    const addLog = (msg: string) => {
      const time = new Date().toISOString().substring(11, 19);
      set((s) => ({ pipelineLogs: [...s.pipelineLogs, `[${time}] ${msg}`] }));
    };

    set({
      pipelineStatus: "preprocessing",
      currentStepIndex: 1,
      pipelineProgress: 15,
      fileMetadata: meta,
      pipelineLogs: [
        `[${new Date().toISOString().substring(11, 19)}] Ingested SAR GeoTIFF: ${meta.name} (${(meta.sizeBytes / (1024 * 1024)).toFixed(1)} MB)`,
        `[${new Date().toISOString().substring(11, 19)}] Channels: VV + VH dual polarization at 10m Ground Sample Distance`,
      ],
    });

    // Step 1: Preprocessing SAR (1000ms)
    addLog("Applying 7x7 Enhanced Lee Speckle Filter to VV & VH SAR backscatter...");
    addLog("Calibrating Radiometric Sigma0 backscatter values (range: -32.4 dB to +4.2 dB)...");
    addLog("Orthorectification & Range-Doppler Terrain Correction against Copernicus DEM 30m...");

    await new Promise((r) => setTimeout(r, 1000));

    // Step 2: Running U-Net++ segmentation (2000ms)
    set({
      pipelineStatus: "segmenting",
      currentStepIndex: 2,
      pipelineProgress: 40,
    });
    addLog("Initializing U-Net++ architecture with ResNet-34 encoder (24.2M weights)...");
    addLog("Evaluating dense skip connections with deep supervision (L_bce + L_dice)...");
    addLog("Computing pixel-level flood probability map across 4,194,304 SAR pixels...");
    addLog("Validation IoU reached: 0.621 (Precision: 0.84, Recall: 0.79)...");

    await new Promise((r) => setTimeout(r, 2000));

    // Step 3: Running PINN depth estimation (2000ms)
    set({
      pipelineStatus: "estimating_depth",
      currentStepIndex: 3,
      pipelineProgress: 75,
    });
    addLog("Formulating Physics-Informed Neural Network (PINN) hydraulic loss functions...");
    addLog("Enforcing 2D Shallow Water Equations & Manning-Strickler friction (n = 0.035 s/m^(1/3))...");
    addLog("Boundary conditions coupled with ERA5 24h accumulated rainfall (245 mm)...");
    addLog("PINN optimizer converged (Navier-Stokes hydrodynamic residual: 4.2e-5)...");
    addLog("Generated continuous 2D water depth bathymetric field (0.00m to 4.62m)...");

    await new Promise((r) => setTimeout(r, 2000));

    // Step 4: Classifying flood risk (1000ms)
    set({
      pipelineStatus: "classifying_risk",
      currentStepIndex: 4,
      pipelineProgress: 95,
    });
    addLog("Executing multi-criteria vulnerability index (Hazard = Depth × Velocity × Exposure)...");
    addLog("Intersecting flooded footprint with OpenStreetMap critical infrastructure...");
    addLog("Identified 3 hospitals, 11 electrical substations, 42.5 km of arterial roads exposed.");

    await new Promise((r) => setTimeout(r, 1000));

    // Step 5: Completed
    set({
      pipelineStatus: "completed",
      currentStepIndex: 5,
      pipelineProgress: 100,
      analysisResults: DEFAULT_RESULTS,
    });
    addLog("✓ Pipeline synthesis complete. Synthetic products packaged for export.");
  },
}));
