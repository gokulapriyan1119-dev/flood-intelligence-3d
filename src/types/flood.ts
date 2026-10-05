export interface FloodEvent {
  id: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  eventCount: number;
  peakExtentKm2: number;
  inundationVolumeKm3: number;
  populationExposed: number;
  peakDate: string;
  sarSensor: string;
  polarization: string;
  demSource: string;
  rainfall24hMm: number;
  unetPlusIoU: number;
  pinnMaxDepthM: number;
  pinnMeanDepthM: number;
  severity: "Moderate" | "Severe" | "Catastrophic";
  description: string;
  satelliteThumbUrl?: string;
  infrastructureImpact: {
    hospitals: number;
    substations: number;
    roadsKm: number;
    schools: number;
  };
}

export type PipelineStepStatus = "idle" | "running" | "completed" | "error";

export interface PipelineStep {
  id: number;
  name: string;
  description: string;
  durationMs: number;
}

export interface UploadFileMetadata {
  name: string;
  sizeBytes: number;
  dimensions: string;
  bands: string[];
  sensor: string;
  orbitDirection: "Ascending" | "Descending";
  acquisitionDate: string;
  demModel: string;
  rainfallSource: string;
  centerCoords: [number, number];
}

export interface AnalysisResults {
  floodedAreaKm2: number;
  meanDepthMeters: number;
  peakDepthMeters: number;
  populationAtRisk: number;
  economicExposureUsdM: number;
  unetPlusIoU: number;
  infrastructureExposed: {
    hospitals: number;
    substations: number;
    roadsKm: number;
    schools: number;
  };
  depthDistribution: { depthRange: string; areaKm2: number; percent: number }[];
  hydrograph: { timeHour: string; dischargeM3s: number; waterLevelM: number }[];
  riskBreakdown: { category: string; value: number; color: string }[];
  backscatterProfile: { dbBin: string; waterCount: number; dryCount: number }[];
}

export type ActiveTab =
  | "globe"
  | "terrain"
  | "pipeline"
  | "analysis"
  | "modelspecs"
  | "reports"
  | "profile"
  | "settings";

export interface TerrainControls {
  showTerrain: boolean;
  showWater: boolean;
  showHeatmap: boolean;
  showRisk: boolean;
  waterLevel: number;
  autoRotate: boolean;
  exaggeration: number;
}
