"use client";

import React from "react";
import Link from "next/link";
import { ProfileView } from "@/components/profile/ProfileView";
import { ArrowLeft, Waves } from "lucide-react";

export default function AuthProfilePage() {
  return (
    <div className="min-h-screen bg-space-950 text-slate-100 p-4 sm:p-8 selection:bg-cyan-500/30 selection:text-cyan-neon">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-neon transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Flood Intelligence Dashboard</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Waves className="w-4 h-4 text-cyan-neon" />
            <span className="font-heading font-bold text-xs tracking-wider">
              FLOOD INTELLIGENCE
            </span>
          </div>
        </div>

        <ProfileView />
      </div>
    </div>
  );
}
