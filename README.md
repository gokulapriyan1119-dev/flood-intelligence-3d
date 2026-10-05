# FLOOD INTELLIGENCE

> **Physics-Informed Satellite Flood Mapping**

Production-grade 3D satellite earth observation and hydrodynamic intelligence system powered by:
- **Sentinel-1 C-Band SAR** (VV + VH Dual-Polarization)
- **Copernicus GLO-30 DEM** (30m Topographic Surface)
- **ECMWF ERA5 Precipitation Reanalysis** (24h Forcing)
- **U-Net++ Segmentation** (ResNet-34 Encoder, Test IoU: 0.62)
- **Physics-Informed Neural Network (PINN)** (Manning Navier-Stokes Hydrodynamic Depth Solver)

## Features
- **3D Global Monitor**: Interactive rotating Earth globe with 8 benchmark flood observatories (Bolivia, Ghana, India, Nigeria, Pakistan, Paraguay, Sri Lanka, USA).
- **3D Terrain Bathymetry Viewer**: DEM displaced 3D mesh with animated water plane, flood wave simulation, and layer toggles (`[Terrain]`, `[Water]`, `[Heatmap]`, `[Risk]`, `[Reset]`).
- **SAR Ingestion Pipeline**: Drag-and-drop GeoTIFF ingestion wired to a FastAPI backend with progressive multi-stage inference.
- **Hydrological Risk Analytics**: Hydrograph simulation, depth distribution, SAR backscatter polarization profiles, and critical infrastructure matrices.
- **10-Page Scientific PDF Reports**: Detailed institutional situation reports exportable with 1-click.
- **Authentication with 2FA/OTP**: Login, Signup, OTP Verification, and Profile management.

## Tech Stack
- Next.js 14 App Router, TypeScript strict mode
- Three.js + React Three Fiber + @react-three/drei
- TailwindCSS + Framer Motion
- Recharts + jsPDF
- Zustand + Sonner Toasts
