"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthBackgroundGlobe } from "@/components/auth/AuthBackgroundGlobe";
import { Waves, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { startSignup } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      setHasError(true);
      toast.error("Full name must be at least 2 characters.");
      return;
    }

    if (!email || !email.includes("@")) {
      setHasError(true);
      toast.error("Please enter a valid institutional email address.");
      return;
    }

    if (password.length < 8) {
      setHasError(true);
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setHasError(true);
      toast.error("Passwords do not match.");
      return;
    }

    if (!agreedDisclaimer) {
      setHasError(true);
      toast.error("You must agree to the research-use disclaimer.");
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const res = await startSignup(name, email, password);
      setIsLoading(false);

      if (res.success) {
        toast.success(res.message);
        if (res.previewUrl) {
          toast("Email Preview Available", {
            description: "Click below to view the dispatched email in your test inbox",
            action: {
              label: "Open Inbox",
              onClick: () => window.open(res.previewUrl!, "_blank"),
            },
            duration: 8000,
          });
        }
        router.push("/auth/verify-otp");
      } else {
        setHasError(true);
        toast.error(res.message);
      }
    } catch {
      setIsLoading(false);
      setHasError(true);
      toast.error("Unexpected error creating account. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-space-950 text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-neon">
      {/* Background Subtle 3D Globe */}
      <AuthBackgroundGlobe />

      {/* Centered Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: hasError ? [0, -8, 8, -8, 8, 0] : 0,
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 w-full max-w-[440px] rounded-3xl glass-panel p-8 shadow-cyan-glow-lg border ${
          hasError ? "border-red-500/50 shadow-red-500/20" : "border-cyan-500/30"
        }`}
      >
        {/* Brand Logo & Tagline */}
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-neon shadow-cyan-glow mb-1">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="font-heading font-bold text-2xl tracking-wider text-slate-100">
            CREATE <span className="text-cyan-neon">ACCOUNT</span>
          </h1>
          <p className="text-xs font-mono text-cyan-400 tracking-wide">
            Real-Time Satellite Flood Intelligence System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1 uppercase text-[10px]">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alexander Wright"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 uppercase text-[10px]">
              Real Email Address (Receives OTP)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@organization.org"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 uppercase text-[10px]">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 uppercase text-[10px]">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <input
              type="checkbox"
              id="disclaimer"
              checked={agreedDisclaimer}
              onChange={(e) => setAgreedDisclaimer(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 accent-cyan-400 rounded cursor-pointer"
            />
            <label htmlFor="disclaimer" className="text-slate-400 text-[10px] leading-tight cursor-pointer">
              I agree to the research-use disclaimer and mission parameters governing satellite SAR hydrological modeling.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-cyan-glow hover:shadow-cyan-glow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Verification OTP...</span>
              </>
            ) : (
              <>
                <span>Create Account & Send Email OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs font-mono text-slate-400">
          <span>Already registered? </span>
          <Link
            href="/auth/login"
            className="text-cyan-neon hover:underline font-bold"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
