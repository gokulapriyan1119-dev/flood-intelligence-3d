# 🌊 FLOOD INTELLIGENCE 3D
### Physics-Informed Satellite Flood Mapping & Real-Time Emergency Response

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black)](https://threejs.org/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success)](https://flood-intelligence-3d-cy4j.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)](tests/auth.test.js)

A production-grade, open-source 3D earth observation platform that integrates **Sentinel-1 Synthetic Aperture Radar (SAR)** imagery, **Copernicus DEM (GLO-30)** topographic bathymetry, and **Physics-Informed Neural Networks (PINNs)** to predict continuous flood inundation depth.

---

## 🏆 Bharat WIN (Jal Shakti Hackathon) — Submission Package

| Deliverable | Repository Asset & Link | Status |
| :--- | :--- | :---: |
| **🌐 24/7 Live Web App** | [flood-intelligence-3d-cy4j.vercel.app](https://flood-intelligence-3d-cy4j.vercel.app/) | ✅ Deployed & Active |
| **📑 Technical Design Document (PDF)** | [Bharat_WIN_Technical_Design_Document.pdf](./Bharat_WIN_Technical_Design_Document.pdf) | ✅ 23-Page Specification |
| **📐 Architectural Diagrams (SVG)** | [`system_architecture.svg`](./public/system_architecture.svg) · [`data_flow.svg`](./public/data_flow.svg) · [`model_architecture.svg`](./public/model_architecture.svg) | ✅ Vector 1080p |
| **⚙️ Setup & Environment Variables** | [Setup Guide & `.env.local.example`](#%EF%B8%8F-quickstart--setup-guide) | ✅ Complete |
| **🧪 Sample Data & Test Cases** | [`sample_data/`](./sample_data/) · [`tests/auth.test.js`](./tests/auth.test.js) (`npm test`) | ✅ 100% Pass (4/4) |
| **📜 Open-Source License** | [MIT License](./LICENSE) | ✅ MIT Licensed |

---

## 🚀 Key Features

* **🛰️ Interactive 3D Blue Marble Globe:** Rotating 3D earth powered by Three.js & NASA textures with global flood hotspots, pulse rings, and coordinate geocoding.
* **🌊 3D Hydrodynamic Bathymetry Viewer:** Terrain mesh displaced by 30m Copernicus DEM elevations with real-time wave simulation and flood extent toggles.
* **📈 Dynamic Cross-Section Profiler:** Real-time 2D elevation cut-through showing water surface level, terrain bedrock, and max water depth.
* **📥 SAR GeoTIFF Ingestion Pipeline:** Drag-and-drop dual-pol (VV + VH) raster processing with instant U-Net++ segmentation and Manning PINN depth solving.
* **📊 Hydrological Risk Analytics:** Hydrograph flood hydro-curves, water depth distribution histograms, and critical infrastructure vulnerability matrices.
* **📄 Automated 10-Page Emergency Assessment PDF:** Generates institutional situation reports with executive summaries, risk tables, and maps via `jsPDF`.
* **🗺️ Spec-Compliant TIFF 6.0 RGB Export:** Download full-resolution GeoTIFF rasters viewable natively in Windows Photos, QGIS, and ArcGIS.
* **🛡️ Production Hybrid Authentication:**
  * **New Users:** Real-time 6-digit OTP verification dispatched to their inbox via Google SMTP (`smtp.gmail.com:465`).
  * **Returning Users:** Direct encrypted password login without repeating OTP.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, React Three Fiber (`@react-three/fiber`), Three.js, TailwindCSS, Zustand, Recharts, Framer Motion, Lucide Icons.
* **Backend & ML Engine:** FastAPI, PyTorch, U-Net++ (ResNet-34), Manning Hydrodynamic PINN, Node.js API runtime.
* **Reporting & Formats:** `jsPDF`, Spec-compliant TIFF 6.0 binary writer.
* **Security & Auth:** Nodemailer, Google SMTP (SSL 465), SHA-256 password salting, cryptographic OTP token generation.
* **Deployment:** Vercel Edge Cloud, Docker, Cloudflare Tunnel.

---

## ⚙️ Quickstart & Setup Guide

### 1. Prerequisites
* **Node.js:** v18.17.0 or higher
* **npm:** v9.0.0 or higher
* **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/gokulapriyan1119-dev/flood-intelligence-3d.git
cd flood-intelligence-3d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory (you can copy `.env.local.example`):
```bash
cp .env.local.example .env.local
```

Populate the required keys in `.env.local`:
```env
# Outgoing SMTP Configuration for Real-Time Email OTP Verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_google_app_password
SMTP_FROM="Flood Intelligence Security <your_email@gmail.com>"
```
*(Note: If SMTP credentials are not configured, the platform automatically generates ephemeral Ethereal test inboxes with instant preview links).*

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm run start
```

---

## 🧪 Automated Test Suite

Run the built-in unit and integration test suite:
```bash
npm test
```

### Test Coverage:
* `SHA-256` Password Hashing Consistency & Security
* Cryptographically Secure 6-Digit OTP Generation
* OTP Expiration Rule Verification (10-minute lifetime)
* Brute-Force Lockout (Lock after 5 failed attempts)

---

## 📂 Project Structure

```
flood-intelligence-3d/
├── .env.local.example       # Example environment variables
├── TECHNICAL_DESIGN.md      # Detailed system architecture document
├── LICENSE                  # Open-source MIT License
├── package.json             # Dependencies and test scripts
├── public/
│   └── textures/            # NASA Blue Marble textures
├── sample_data/             # Real-world benchmark flood datasets
│   ├── sample_flood_event.json
│   └── sample_sar_parameters.json
├── src/
│   ├── app/                 # Next.js 14 App Router pages & API routes
│   │   ├── api/auth/        # Login, send-otp, and verify-otp endpoints
│   │   ├── api/predict/     # SAR inference pipeline
│   │   └── auth/            # Sign in, Sign up, OTP verification pages
│   ├── components/          # 3D Globe, Terrain, Upload, Reports, TopBar
│   ├── store/               # Zustand global state (Auth & Flood store)
│   └── utils/               # Nodemailer, OTP store, TIFF export, PDF generator
└── tests/
    └── auth.test.js         # Automated test cases
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.
