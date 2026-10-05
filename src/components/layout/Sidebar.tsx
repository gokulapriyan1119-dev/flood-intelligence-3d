"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFloodStore } from "@/store/useFloodStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ActiveTab } from "@/types/flood";
import {
  Globe,
  Mountain,
  Radio,
  BarChart3,
  Cpu,
  FileText,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Waves,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const router = useRouter();
  const { activeTab, setActiveTab } = useFloodStore();
  const { user, logout } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Exact 8 items in the exact required order
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "globe", label: "3D Global Monitor", icon: <Globe className="w-5 h-5 shrink-0" /> },
    { id: "terrain", label: "3D Terrain Bathymetry", icon: <Mountain className="w-5 h-5 shrink-0" /> },
    { id: "pipeline", label: "SAR Ingestion Pipeline", icon: <Radio className="w-5 h-5 shrink-0" /> },
    { id: "analysis", label: "Risk & Hydrology Analytics", icon: <BarChart3 className="w-5 h-5 shrink-0" /> },
    { id: "modelspecs", label: "Model Specs", icon: <Cpu className="w-5 h-5 shrink-0" /> },
    { id: "reports", label: "Reports & PDF Export", icon: <FileText className="w-5 h-5 shrink-0" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5 shrink-0" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5 shrink-0" /> },
  ];

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
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-space-950/95 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col justify-between ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Top Header with Brand */}
      <div>
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-cyan-neon shadow-cyan-glow shrink-0">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-heading font-bold text-sm tracking-wider text-slate-100 block">
                  FLOOD <span className="text-cyan-neon">INTELLIGENCE</span>
                </span>
                <span className="text-[9px] font-mono text-cyan-400 block truncate">
                  Physics-Informed Mapping
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-cyan-neon" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 8 Navigation Items */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setActiveTab(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center rounded-xl text-xs font-mono transition-all duration-200 group relative ${
                    collapsed ? "justify-center p-2.5" : "px-3 py-2.5 space-x-3"
                  } ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-neon border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <span
                    className={`transition-colors ${
                      isActive ? "text-cyan-neon" : "group-hover:text-cyan-400"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="truncate text-left">{item.label}</span>
                  )}
                </button>

                {/* Floating Tooltip when collapsed */}
                {collapsed && hoveredItem === item.id && (
                  <div className="absolute left-[72px] top-1/2 -translate-y-1/2 z-50 glass-panel px-3 py-1.5 rounded-lg border border-cyan-400/40 shadow-cyan-glow text-xs font-mono text-cyan-neon whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Sign Out Bar */}
      <div className="p-2 border-t border-cyan-500/20 bg-space-900/60">
        <div
          className={`flex items-center justify-between rounded-xl p-1.5 ${
            collapsed ? "flex-col space-y-2" : "space-x-2"
          }`}
        >
          <div
            onClick={() => setActiveTab("profile")}
            className="flex items-center space-x-2 cursor-pointer overflow-hidden group"
            title="Open Profile"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-neon font-mono text-xs font-bold shrink-0 shadow-cyan-glow group-hover:border-cyan-300">
              {getInitials(user?.name)}
            </div>

            {!collapsed && (
              <div className="truncate">
                <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-neon truncate">
                  {user?.name || "Dr. Elena Rostova"}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {user?.role?.split(" ")[0] || "Hydrologist"}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
