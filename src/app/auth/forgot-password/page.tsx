"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AuthBackgroundGlobe } from "@/components/auth/AuthBackgroundGlobe";
import { KeyRound, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setSubmitted(true);
    toast.success("Password reset instructions dispatched to your inbox.");
  };

  return (
    <div className="relative min-h-screen bg-space-950 text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-neon">
      <AuthBackgroundGlobe />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] rounded-3xl glass-panel p-8 shadow-cyan-glow-lg border border-cyan-500/30"
      >
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-neon shadow-cyan-glow mb-1">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="font-heading font-bold text-2xl tracking-wider text-slate-100">
            RESET <span className="text-cyan-neon">CREDENTIALS</span>
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Provide your institutional email to receive a secure recovery link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-5 text-center text-xs font-mono">
            <div className="p-4 rounded-xl bg-space-900/80 border border-cyan-500/30 text-cyan-300">
              Recovery instructions have been dispatched to:
              <span className="block font-bold text-white mt-1">{email}</span>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center space-x-2 text-cyan-neon hover:underline font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1 uppercase text-[10px]">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.gov"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900/90 border border-white/10 focus:border-cyan-400 text-slate-100 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-cyan-glow hover:shadow-cyan-glow-lg transition-all"
            >
              <span>Dispatch Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3">
              <Link
                href="/auth/login"
                className="text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
              >
                &larr; Remember your password? Sign In
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
