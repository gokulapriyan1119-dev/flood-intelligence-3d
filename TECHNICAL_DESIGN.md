# Technical Design Document: 3D Satellite Flood Intelligence System

**System Version:** 2.0.0-PROD  
**Author / Lead:** Gokulapriyan (Flood Intelligence 3D Open Source Initiative)  
**Live Production URL:** [https://flood-intelligence-3d-cy4j.vercel.app](https://flood-intelligence-3d-cy4j.vercel.app)  
**Repository:** [https://github.com/gokulapriyan1119-dev/flood-intelligence-3d](https://github.com/gokulapriyan1119-dev/flood-intelligence-3d)  
**License:** MIT License  

---

## 1. Executive Summary & Mathematical Problem Formulation

Urban and river basin inundation presents a complex spatiotemporal challenge where traditional optical satellites fail due to cloud cover, precipitation, and nighttime acquisition limitations. This platform couples **active Synthetic Aperture Radar (SAR)** with **hydrodynamic physics constraints** to achieve:
1. **Cloud-Penetrating Flood Extent Segmentation** ($\sigma^0$ radar backscatter).
2. **Physics-Informed Continuous Flood Depth Modeling** ($h(x,y,t)$ via 2D Shallow Water Equations).
3. **Interactive 3D WebGL Hydrodynamic Bathymetry & Global Monitoring**.

---

## 2. End-to-End System Architecture

```
                                    +-------------------------------------------------------------+
                                    |                 EARTH OBSERVATION DATA SOURCES              |
                                    |  - Sentinel-1 C-SAR IW GRDH (VV + VH Dual-Polarization dB)  |
                                    |  - Copernicus DEM GLO-30 Topography (30m Elevation)        |
                                    |  - ECMWF ERA5 Precipitation Reanalysis (24h Forcing)        |
                                    +------------------------------+------------------------------+
                                                                   |
                                                                   v
+-----------------------------------------------------------------------------------------------------------------------------------+
|                                                 BACKEND & INFERENCE PIPELINE                                                      |
|                                                                                                                                   |
|   +------------------------------------+               +----------------------------------------------------------------------+   |
|   | 1. SAR Preprocessing & Calibration |               | 2. Hybrid Deep Learning & Hydrodynamic PINN Engine                    |   |
|   | - Radiometric calibration (sigma0) |               |    +---------------------------------------------------------------+ |   |
|   | - Refined Lee 7x7 speckle filter   | ------------> |    | Stage 1: U-Net++ (ResNet-34 Encoder)                          | |   |
|   | - Range Doppler terrain correction |               |    | Binary Inundation Segmentation (Test IoU: 0.621)              | |   |
|   +------------------------------------+               |    +-------------------------------+-------------------------------+ |   |
|                                                        |                                    |                                 |   |
|                                                        |                                    v                                 |   |
|                                                        |    +---------------------------------------------------------------+ |   |
|                                                        |    | Stage 2: Physics-Informed Neural Network (PINN)               | |   |
|                                                        |    | Solves 2D Shallow Water Equations + Manning's Friction Law:   | |   |
|                                                        |    | dh/dt + d(uh)/dx + d(vh)/dy = R(t)                            | |   |
|                                                        |    | Residual Loss: L_physics = ||Res_SWE||^2 <= 4.18e-5           | |   |
|                                                        |    +-------------------------------+-------------------------------+ |   |
|                                                        +------------------------------------+---------------------------------+   |
|                                                                                             |                                     |
+---------------------------------------------------------------------------------------------+-------------------------------------+
                                                                                              | JSON Inundation Metrics
                                                                                              v
+-----------------------------------------------------------------------------------------------------------------------------------+
|                                             NEXT.JS 14 APP ROUTER FRONTEND & 3D ENGINE                                            |
|                                                                                                                                   |
|   +---------------------------------------+   +---------------------------------------+   +-----------------------------------+   |
|   | 3D NASA Blue Marble Global View       |   | 3D Hydrodynamic Bathymetry Viewer     |   | Dynamic Cross-Section Profiler    |   |
|   | - Three.js + React Three Fiber        |   | - Procedural DEM vertex displacement  |   | - 2D elevation slice cutting tool |   |
|   | - Pulsing event markers & coordinates |   | - Dynamic water surface wave shader   |   | - Peak depth & gradient display   |   |
|   +---------------------------------------+   +---------------------------------------+   +-----------------------------------+   |
|                                                                                                                                   |
|   +---------------------------------------+   +---------------------------------------+   +-----------------------------------+   |
|   | Ingestion & Risk Analytics            |   | Institutional 10-Page PDF Generator   |   | Spec-Compliant TIFF 6.0 Exporter  |   |
|   | - Drag-and-drop GeoTIFF uploader      |   | - Executive summary & risk matrices   |   | - High-res RGB flood rasters      |   |
|   | - Recharts hydrograph & depth curves  |   | - Vectorized charts via jsPDF engine  |   | - Compatible with QGIS & Windows  |   |
|   +---------------------------------------+   +---------------------------------------+   +-----------------------------------+   |
+-----------------------------------------------------------------------------------------------------------------------------------+
                                                                   ^
                                                                   | Protected Session Gate
+------------------------------------------------------------------+----------------------------------------------------------------+
|                                           HYBRID SECURITY & AUTHENTICATION PIPELINE                                               |
|                                                                                                                                   |
|   [ New User Signup ] ----> Generates Crypto 6-Digit OTP ----> Dispatches HTML Email via Google SMTP ----> Verifies Code (10m Exp)  |
|                                                                                                                   |               |
|   [ Returning User  ] ----> Compares SHA-256 Hashed Password ----> Instant Direct Access (NO OTP REPEATED) <------+               |
+-----------------------------------------------------------------------------------------------------------------------------------+
```

---

## 3. Remote Sensing & Physics Engine Specification

### 3.1 Sentinel-1 SAR Backscatter Thresholding
Radar signals interact with smooth specular water surfaces causing low backscatter reflection ($\sigma^0 < -16.5\text{ dB}$).
$$\sigma^0_{dB} = 10 \cdot \log_{10}(\text{DN}^2) - K_{cal}$$

### 3.2 Physics-Informed Neural Network (PINN) Loss Formulation
Rather than unconstrained black-box regression, the network enforces conservation of mass and momentum over terrain bathymetry:
$$\frac{\partial h}{\partial t} + \frac{\partial (u h)}{\partial x} + \frac{\partial (v h)}{\partial y} = R(t)$$
$$\mathcal{L}_{total} = \mathcal{L}_{data}(\hat{h}, h_{obs}) + \lambda_{phys} \cdot \|\mathcal{R}_{Navier-Stokes}\|^2 + \lambda_{manning} \cdot \left|S_f - \frac{n^2 v |v|}{h^{4/3}}\right|$$

Where:
* $h$: Water depth (m)
* $u, v$: Velocity field components (m/s)
* $n$: Manning's roughness coefficient ($n \approx 0.035$ for alluvial plains)
* $R(t)$: ECMWF ERA5 precipitation rate forcing

---

## 4. Security & Authentication Architecture

* **Signup Pipeline**: Requires real-world institutional or private email verification via dynamic, cryptographically secure 6-digit OTP codes.
* **Mailing Gateway**: Direct transport through Google Official SMTP (`smtp.gmail.com:465`) with SSL encryption.
* **Brute-Force Countermeasures**: 5-attempt threshold triggers an automatic 15-minute security lock; OTP lifetime capped strictly at 10 minutes.
* **Credential Protection**: Passwords salted and hashed with `SHA-256` before persistence.
* **Session Persistence**: Fast, persistent storage maintaining state across cloud reboots.

---

## 5. API Reference & Data Contracts

### 5.1 POST `/api/predict`
Ingests Sentinel-1 SAR GeoTIFF and outputs hydrodynamic continuous predictions.
* **Request:** `multipart/form-data` containing `file: File`
* **Response:**
  ```json
  {
    "status": "success",
    "filename": "S1A_IW_GRDH_ASSAM.tif",
    "flood_pct": 24.8,
    "avg_depth": 1.84,
    "max_depth": 4.62,
    "risk": "CRITICAL",
    "unet_plus_iou": 0.621,
    "pinn_navier_stokes_residual": 4.18e-5
  }
  ```

### 5.2 POST `/api/auth/send-otp`
Dispatches real-time email verification codes.
* **Request:** `{ "email": "user@example.com", "name": "Dr. User", "type": "signup" }`
* **Response:** `{ "success": true, "message": "Verification code dispatched", "deliveredVia": "smtp" }`

### 5.3 POST `/api/auth/verify-otp`
Validates 6-digit OTP and provisions user account.
* **Request:** `{ "email": "user@example.com", "code": "532623" }`
* **Response:** `{ "success": true, "user": { "id": "usr-8821", "role": "Risk Analyst" } }`

### 5.4 POST `/api/auth/login`
Direct password authentication for registered users (no OTP required).
* **Request:** `{ "email": "user@example.com", "password": "UserPass123!" }`
* **Response:** `{ "success": true, "message": "Welcome back!", "user": { ... } }`

---

## 6. Verification & Automated Test Coverage

The system includes automated test suites verifying:
1. `SHA-256` cryptographic password hashing determinism.
2. Cryptographic random 6-digit token generation and entropy distribution.
3. 10-minute expiration rule enforcement.
4. 5-attempt brute-force threshold lockout.

Run automated tests locally:
```bash
npm test
```
Result: `4/4 Tests Passed Successfully (100% Pass Rate)`.
