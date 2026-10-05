import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FLOOD INTELLIGENCE | Physics-Informed Satellite Flood Mapping",
  description:
    "Physics-Informed Satellite Flood Mapping powered by Sentinel-1 SAR, Copernicus DEM, U-Net++ segmentation, and Physics-Informed Neural Networks (PINN).",
  keywords: [
    "Flood Intelligence",
    "Physics-Informed Satellite Flood Mapping",
    "Sentinel-1 SAR",
    "3D Terrain Bathymetry",
    "U-Net++",
    "Physics-Informed Neural Network",
    "Hydrology",
    "Earth Observation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased bg-space-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-neon`}
      >
        {children}
        <Toaster
          richColors
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#050B14",
              border: "1px solid rgba(0, 240, 255, 0.25)",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}
