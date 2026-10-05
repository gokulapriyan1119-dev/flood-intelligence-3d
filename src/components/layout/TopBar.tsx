"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFloodStore } from "@/store/useFloodStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface TopBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ collapsed, setCollapsed }) => {
  const router = useRouter();
  const { activeTab, setActiveTab, selectedEvent } = useFloodStore();
  const { user, logout } = useAuthStore();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic titles per route / activeTab
  const pageTitles: Record<string, string> = {
    globe: "3D Global Monitor — Planetary SAR Inundation Sentinel",
    terrain: "3D Terrain Bathymetry Viewer — Hydrodynamic PINN Mesh",
    pipeline: "SAR Ingestion & Deep Learning Pipeline — Sentinel-1 Dual-Pol",
    analysis: "Risk & Hydrology Analytics — Multi-Criteria Assessment",
    modelspecs: "Neural & Hydrodynamic Architecture Specifications",
    reports: "Disaster Situation Reports & 10-Page PDF Export",
    profile: "User Profile & Satellite Earth Observation Credentials",
    settings: "System Configuration & API Gateway Preferences",
  };

  const handleSignOut = () => {
    logout();
    router.push("/auth/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "FI";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full border-b border-cyan-500/20 bg-space-950/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
      {/* Left: Hamburger + Dynamic Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-neon transition-colors"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <h1 className="font-heading font-bold text-sm sm:text-base text-slate-100 tracking-wide truncate max-w-xs sm:max-w-md lg:max-w-xl">
            {pageTitles[activeTab] || "Flood Intelligence Dashboard"}
          </h1>
          <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
            {selectedEvent.country}
          </span>
        </div>
      </div>

      {/* Center: Nothing (as specified) */}
      <div className="hidden md:block" />

      {/* Right: Notifications Bell & User Profile Dropdown */}
      <div className="flex items-center space-x-3">
        {/* Live SAR Beacon Status */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-space-900 border border-white/5 text-[10px] font-mono text-slate-400">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>SATELLITE LINK ACTIVE</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-neon shadow-cyan-glow animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel border border-cyan-500/30 shadow-cyan-glow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-100">
                  Telemetry Notifications
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                  2 New
                </span>
              </div>
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto font-mono text-xs">
                <div className="p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-2 text-cyan-300 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sentinel-1 SAR Pass Ingested</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Sindh &amp; Balochistan Indus basin scene calibrated with Copernicus 30m DEM.
                  </p>
                  <span className="text-[9px] text-slate-500 mt-1 block">12m ago</span>
                </div>

                <div className="p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>PINN Levee Overtopping Warning</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    River stage exceeded 3.2m crest elevation in sector B-4.
                  </p>
                  <span className="text-[9px] text-slate-500 mt-1 block">45m ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-neon font-mono text-xs font-bold shadow-cyan-glow group-hover:border-cyan-300">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-mono text-xs font-semibold text-slate-200 block truncate max-w-[130px] group-hover:text-cyan-neon">
                {user?.name || "Dr. Elena Rostova"}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                {user?.role?.split(" ")[0] || "Hydrologist"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-cyan-500/30 shadow-cyan-glow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-white/10 bg-space-900/60">
                <div className="font-mono text-xs font-bold text-slate-100 truncate">
                  {user?.name}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 truncate">
                  {user?.email}
                </div>
              </div>

              <div className="p-1 space-y-0.5 font-mono text-xs">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setActiveTab("profile");
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-neon hover:bg-cyan-500/10 flex items-center space-x-2 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setActiveTab("settings");
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-neon hover:bg-cyan-500/10 flex items-center space-x-2 transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>

                <div className="my-1 border-t border-white/10" />

                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
