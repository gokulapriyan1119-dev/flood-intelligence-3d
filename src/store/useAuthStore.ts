import { create } from "zustand";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatar?: string;
  bio: string;
  satelliteTier: string;
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  pendingOtpEmail: string | null;
  pendingOtpType: "login" | "signup" | null;
  pendingUserSignup: { name: string; email: string; password?: string } | null;
  latestPreviewUrl: string | null;
  latestDevCode: string | null;
  otpCooldownSeconds: number;

  // Actions
  initializeAuth: () => void;
  startLogin: (
    email: string,
    password?: string
  ) => Promise<{ success: boolean; message: string; previewUrl?: string | null; demoCode?: string }>;
  loginWithPassword: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  startSignup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; previewUrl?: string | null; demoCode?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; message: string }>;
  resendOtp: () => Promise<{ success: boolean; message: string; previewUrl?: string | null; demoCode?: string }>;
  logout: () => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: "usr-hyd-8821",
  name: "Dr. Elena Rostova",
  email: "elena.rostova@flood-intelligence.org",
  role: "Chief Remote Sensing Hydrologist",
  organization: "Copernicus Emergency & Global Disaster Alert System (GDACS)",
  avatar: "",
  bio: "Lead satellite SAR hydrologist specializing in synthetic aperture radar flood extent segmentation and hydrodynamic continuous depth modeling.",
  satelliteTier: "Level-1 GRD / SLC Sentinel-1 SAR Dual-Pol Constellation Access",
  createdAt: "2024-03-15",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthReady: false,
  pendingOtpEmail: null,
  pendingOtpType: null,
  pendingUserSignup: null,
  latestPreviewUrl: null,
  latestDevCode: null,
  otpCooldownSeconds: 0,

  initializeAuth: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("flood_intel_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.user && parsed.isAuthenticated) {
          set({
            user: parsed.user,
            isAuthenticated: true,
            isAuthReady: true,
          });
          return;
        }
      }
    } catch {
      // ignore
    }
    set({
      user: null,
      isAuthenticated: false,
      isAuthReady: true,
    });
  },

  startLogin: async (email: string, password?: string) => {
    const normEmail = email.toLowerCase().trim();
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail, password, type: "login" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Failed to dispatch verification code.",
        };
      }

      set({
        pendingOtpEmail: normEmail,
        pendingOtpType: "login",
        pendingUserSignup: null,
        latestPreviewUrl: data.previewUrl || null,
        latestDevCode: data.demoCode || null,
        otpCooldownSeconds: 60,
      });

      return {
        success: true,
        message: data.message,
        previewUrl: data.previewUrl,
        demoCode: data.demoCode,
      };
    } catch (err) {
      console.error("[AUTH] startLogin error:", err);
      return {
        success: false,
        message: "Network error connecting to security server.",
      };
    }
  },

  loginWithPassword: async (email: string, password: string) => {
    const normEmail = email.toLowerCase().trim();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Invalid email or password.",
        };
      }

      const loggedUser: UserProfile = data.user || {
        ...DEFAULT_DEMO_USER,
        email: normEmail,
        name: normEmail.split("@")[0].replace(/[._-]/g, " "),
      };

      set({
        user: loggedUser,
        isAuthenticated: true,
        pendingOtpEmail: null,
        pendingOtpType: null,
        pendingUserSignup: null,
        latestPreviewUrl: null,
        latestDevCode: null,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "flood_intel_auth",
          JSON.stringify({ user: loggedUser, isAuthenticated: true })
        );
      }

      return {
        success: true,
        message: data.message || "Welcome back!",
        user: loggedUser,
      };
    } catch (err) {
      console.error("[AUTH] loginWithPassword error:", err);
      return {
        success: false,
        message: "Network error connecting to authentication server.",
      };
    }
  },

  startSignup: async (name: string, email: string, password: string) => {
    const normEmail = email.toLowerCase().trim();
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: normEmail,
          password,
          type: "signup",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Failed to create account or send verification code.",
        };
      }

      set({
        pendingOtpEmail: normEmail,
        pendingOtpType: "signup",
        pendingUserSignup: { name: name.trim(), email: normEmail, password },
        latestPreviewUrl: data.previewUrl || null,
        latestDevCode: data.demoCode || null,
        otpCooldownSeconds: 60,
      });

      return {
        success: true,
        message: data.message,
        previewUrl: data.previewUrl,
        demoCode: data.demoCode,
      };
    } catch (err) {
      console.error("[AUTH] startSignup error:", err);
      return {
        success: false,
        message: "Network error connecting to authentication server.",
      };
    }
  },

  verifyOtp: async (code: string) => {
    const state = get();
    const email = state.pendingOtpEmail;

    if (!email) {
      return {
        success: false,
        message: "No pending verification session. Please sign in or register.",
      };
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Invalid verification code.",
        };
      }

      const verifiedUser: UserProfile = data.user || {
        ...DEFAULT_DEMO_USER,
        email,
        name: state.pendingUserSignup?.name || email.split("@")[0],
      };

      set({
        user: verifiedUser,
        isAuthenticated: true,
        pendingOtpEmail: null,
        pendingOtpType: null,
        pendingUserSignup: null,
        latestPreviewUrl: null,
        latestDevCode: null,
        otpCooldownSeconds: 0,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "flood_intel_auth",
          JSON.stringify({ user: verifiedUser, isAuthenticated: true })
        );
      }

      return {
        success: true,
        message: data.message || "Email verified! Welcome to Flood Intelligence.",
      };
    } catch (err) {
      console.error("[AUTH] verifyOtp error:", err);
      return {
        success: false,
        message: "Network error validating verification code.",
      };
    }
  },

  resendOtp: async () => {
    const state = get();
    const email = state.pendingOtpEmail;
    if (!email) {
      return { success: false, message: "No active verification session to resend code for." };
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: state.pendingUserSignup?.name,
          type: state.pendingOtpType || "signup",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || "Failed to resend code." };
      }

      set({
        otpCooldownSeconds: 60,
        latestPreviewUrl: data.previewUrl || null,
        latestDevCode: data.demoCode || null,
      });

      return {
        success: true,
        message: data.message,
        previewUrl: data.previewUrl,
        demoCode: data.demoCode,
      };
    } catch {
      return { success: false, message: "Network error while resending code." };
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      pendingOtpEmail: null,
      pendingOtpType: null,
      pendingUserSignup: null,
      latestPreviewUrl: null,
      latestDevCode: null,
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("flood_intel_auth");
    }
  },

  updateProfile: (profileUpdates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...profileUpdates };
    set({ user: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "flood_intel_auth",
        JSON.stringify({ user: updated, isAuthenticated: true })
      );
    }
  },
}));
