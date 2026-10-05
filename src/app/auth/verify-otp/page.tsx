"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthBackgroundGlobe } from "@/components/auth/AuthBackgroundGlobe";
import { KeyRound, ArrowRight, RotateCcw, Mail, Loader2, ExternalLink } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const {
    pendingOtpEmail,
    verifyOtp,
    resendOtp,
    otpCooldownSeconds,
    latestPreviewUrl,
    latestDevCode,
  } = useAuthStore();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(otpCooldownSeconds || 60);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const clean = value.replace(/\D/g, "");
    if (!clean && value !== "") return;

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);

    // Auto-advance focus to next box
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || "";
    }
    setDigits(newDigits);

    // Focus on next empty box or the last box
    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setHasError(true);
      toast.error("Please enter all 6 digits of your email verification code.");
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const res = await verifyOtp(code);
      setIsLoading(false);

      if (res.success) {
        toast.success(res.message);
        router.push("/");
      } else {
        setHasError(true);
        toast.error(res.message);
      }
    } catch {
      setIsLoading(false);
      setHasError(true);
      toast.error("Verification failed. Please check the code and try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    const res = await resendOtp();
    setIsLoading(false);

    if (res.success) {
      setCooldown(60);
      toast.success(res.message);
      if (res.previewUrl) {
        toast("Email Dispatched", {
          description: "Click below to open the test inbox preview",
          action: {
            label: "Open Inbox",
            onClick: () => window.open(res.previewUrl!, "_blank"),
          },
          duration: 8000,
        });
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-space-950 text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-neon">
      {/* Background Subtle 3D Globe */}
      <AuthBackgroundGlobe />

      {/* Centered Glassmorphic Card (max-w 440px) */}
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
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-neon shadow-cyan-glow mb-1">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="font-heading font-bold text-2xl tracking-wider text-slate-100">
            EMAIL <span className="text-cyan-neon">VERIFICATION</span>
          </h1>
          <p className="text-xs font-mono text-slate-400">
            A 6-digit real-time verification code has been dispatched to:
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-neon font-bold truncate max-w-[280px]">
              {pendingOtpEmail || "your email address"}
            </span>
          </div>
        </div>

        {/* Live Email Inbox Preview Notice if using Ethereal */}
        {latestPreviewUrl && (
          <div className="mb-5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 font-medium">Test Email Delivered</span>
            </div>
            <a
              href={latestPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-cyan-neon hover:underline font-bold"
            >
              <span>View Mail</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Development Helper Badge if custom SMTP is not yet set in .env.local */}
        {latestDevCode && !process.env.NEXT_PUBLIC_DISABLE_DEV_OTP && (
          <div className="mb-5 p-2.5 rounded-xl bg-space-900/70 border border-white/10 text-center text-[11px] font-mono text-slate-400">
            <span>Server Generated OTP: </span>
            <span className="text-cyan-neon font-bold font-mono tracking-wider">
              {latestDevCode}
            </span>
            <span className="block text-[9px] text-slate-500 mt-0.5">
              (Valid for 10 minutes &bull; Sent via Nodemailer)
            </span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 Digit Numeric Inputs */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isLoading}
                className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl bg-space-900/90 border text-slate-100 outline-none transition-all ${
                  hasError
                    ? "border-red-500 text-red-300 shadow-red-500/20"
                    : digit
                    ? "border-cyan-400 shadow-cyan-glow text-cyan-neon"
                    : "border-white/10 focus:border-cyan-400 focus:shadow-cyan-glow"
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || digits.join("").length < 6}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold text-xs font-mono flex items-center justify-center space-x-2 shadow-cyan-glow hover:shadow-cyan-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <span>Confirm & Access 3D Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Cooldown Counter */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isLoading}
            className={`flex items-center space-x-1.5 transition-colors ${
              cooldown > 0
                ? "text-slate-500 cursor-not-allowed"
                : "text-cyan-neon hover:underline cursor-pointer"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resend New Code</span>
          </button>

          <span className="text-slate-500 text-[11px]">
            {cooldown > 0 ? `Wait ${cooldown}s` : "Ready to resend"}
          </span>
        </div>

        <div className="mt-4 text-center text-[11px] font-mono">
          <Link
            href="/auth/signup"
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            &larr; Return to Sign Up / Change Email
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
