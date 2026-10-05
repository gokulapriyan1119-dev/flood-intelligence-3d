"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import {
  User,
  ShieldCheck,
  Save,
  Radio,
} from "lucide-react";

export const ProfileView: React.FC = () => {
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || "Dr. Elena Rostova");
  const [email, setEmail] = useState(user?.email || "elena.rostova@flood-intelligence.org");
  const [role, setRole] = useState(user?.role || "Chief Remote Sensing Hydrologist");
  const [organization, setOrganization] = useState(
    user?.organization || "Copernicus Emergency & Global Disaster Alert System (GDACS)"
  );
  const [bio, setBio] = useState(
    user?.bio ||
      "Lead satellite SAR hydrologist specializing in synthetic aperture radar flood extent segmentation and hydrodynamic PINN continuous depth modeling."
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      role,
      organization,
      bio,
    });
    toast.success("User profile and satellite authorization parameters updated!");
  };

  const getInitials = (n?: string) => {
    if (!n) return "FI";
    return n
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-heading font-bold text-2xl text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-cyan-neon" />
            User Profile &amp; Mission Authorization
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage your credentials, institutional affiliation, and satellite data clearance.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-neon border border-cyan-400/30 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>LEVEL-3 SAR CLEARANCE</span>
        </span>
      </div>

      {/* Main Profile Form Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-6">
          {/* Avatar Banner */}
          <div className="flex items-center space-x-4 border-b border-white/10 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-neon font-mono text-xl font-bold shadow-cyan-glow">
              {getInitials(name)}
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-100">{name}</h3>
              <p className="text-xs font-mono text-cyan-400">{role}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{organization}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1.5 uppercase text-[10px]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-space-950/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 uppercase text-[10px]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-space-950/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 uppercase text-[10px]">
                Operational Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-space-950/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 uppercase text-[10px]">
                Institutional Affiliation
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-space-950/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-slate-400 block mb-1.5 uppercase text-[10px]">
                Hydrological Research Profile &amp; Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-space-950/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Satellite Authorization Badge */}
          <div className="p-4 rounded-xl bg-space-950/80 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3">
              <Radio className="w-5 h-5 text-cyan-neon" />
              <div>
                <span className="text-slate-200 font-bold block">
                  Sentinel-1 SAR C-band Constellation Access
                </span>
                <span className="text-[10px] text-slate-400">
                  Authorized for Level-1 GRD IW dual-polarization download &amp; orthorectification
                </span>
              </div>
            </div>
            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 font-bold">
              ACTIVE
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-mono text-xs font-bold flex items-center gap-2 shadow-cyan-glow transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
