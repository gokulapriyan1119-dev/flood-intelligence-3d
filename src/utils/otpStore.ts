import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: string;
  organization: string;
  avatar?: string;
  bio: string;
  satelliteTier: string;
  createdAt: string;
}

export interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
  purpose: "login" | "signup";
  signupData?: {
    name: string;
    email: string;
    passwordHash?: string;
  };
  lastSentAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __floodOtpStore: Map<string, OtpRecord> | undefined;
  // eslint-disable-next-line no-var
  var __floodUsersStore: Map<string, StoredUser> | undefined;
}

// In-memory singletons across hot-reloads
const otpMap: Map<string, OtpRecord> =
  globalThis.__floodOtpStore || (globalThis.__floodOtpStore = new Map());

const usersMap: Map<string, StoredUser> =
  globalThis.__floodUsersStore || (globalThis.__floodUsersStore = new Map());

// Seed default users if empty
if (!usersMap.has("elena.rostova@flood-intelligence.org")) {
  usersMap.set("elena.rostova@flood-intelligence.org", {
    id: "usr-hyd-8821",
    name: "Dr. Elena Rostova",
    email: "elena.rostova@flood-intelligence.org",
    passwordHash: hashPassword("Sentinel123!"),
    role: "Chief Remote Sensing Hydrologist",
    organization: "Copernicus Emergency & Global Disaster Alert System (GDACS)",
    avatar: "",
    bio: "Lead satellite SAR hydrologist specializing in synthetic aperture radar flood extent segmentation and hydrodynamic continuous depth modeling.",
    satelliteTier: "Level-1 GRD / SLC Sentinel-1 SAR Dual-Pol Constellation Access",
    createdAt: "2024-03-15",
  });
}

// Optional filesystem persistence
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // ignore in read-only environments
  }
}

function loadPersistedUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf-8");
      const list: StoredUser[] = JSON.parse(raw);
      for (const u of list) {
        if (u && u.email) {
          if (u.email.toLowerCase() === "elena.rostova@flood-intelligence.org" && !u.passwordHash) {
            u.passwordHash = hashPassword("Sentinel123!");
          }
          usersMap.set(u.email.toLowerCase(), u);
        }
      }
    }
  } catch {
    // ignore
  }
}

function savePersistedUsers() {
  try {
    ensureDataDir();
    const list = Array.from(usersMap.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch {
    // ignore in restricted env
  }
}

// Initial load
loadPersistedUsers();

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generate6DigitOtp(): string {
  // Cryptographically secure 6-digit number between 100000 and 999999
  const buf = crypto.randomBytes(4);
  const num = (buf.readUInt32BE(0) % 900000) + 100000;
  return num.toString();
}

export function createOrUpdateOtp(
  email: string,
  purpose: "login" | "signup",
  signupData?: { name: string; email: string; password?: string }
): { code: string; expiresAt: number } {
  const normEmail = email.toLowerCase().trim();
  const code = generate6DigitOtp();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

  const record: OtpRecord = {
    code,
    email: normEmail,
    expiresAt,
    attempts: 0,
    purpose,
    signupData: signupData
      ? {
          name: signupData.name,
          email: normEmail,
          passwordHash: signupData.password ? hashPassword(signupData.password) : undefined,
        }
      : undefined,
    lastSentAt: now,
  };

  otpMap.set(normEmail, record);
  return { code, expiresAt };
}

export function getOtpRecord(email: string): OtpRecord | undefined {
  return otpMap.get(email.toLowerCase().trim());
}

export function verifyOtpCode(
  email: string,
  enteredCode: string
): { success: boolean; message: string; user?: StoredUser } {
  const normEmail = email.toLowerCase().trim();
  const record = otpMap.get(normEmail);

  if (!record) {
    return {
      success: false,
      message: "No verification code requested for this email. Please request a new code.",
    };
  }

  const now = Date.now();
  if (now > record.expiresAt) {
    otpMap.delete(normEmail);
    return {
      success: false,
      message: "Verification code has expired (10-minute limit). Please request a new code.",
    };
  }

  if (record.attempts >= 5) {
    otpMap.delete(normEmail);
    return {
      success: false,
      message: "Too many incorrect verification attempts. Security lock triggered. Please request a new code.",
    };
  }

  record.attempts += 1;

  if (record.code !== enteredCode.trim()) {
    const remaining = 5 - record.attempts;
    return {
      success: false,
      message: `Invalid 6-digit verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Code is valid! Consume it
  otpMap.delete(normEmail);

  // If this was signup, save the new user
  let user: StoredUser;
  if (record.purpose === "signup" && record.signupData) {
    user = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: record.signupData.name,
      email: normEmail,
      passwordHash: record.signupData.passwordHash,
      role: "Earth Observation & Flood Risk Analyst",
      organization: "Global Hydrological Assessment Network",
      avatar: "",
      bio: "Operational satellite SAR flood mapping and hydrodynamic emergency assessment specialist.",
      satelliteTier: "Level-1 Copernicus Sentinel-1 SAR Dual-Pol Access",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    usersMap.set(normEmail, user);
    savePersistedUsers();
  } else {
    // Existing user or login
    const existing = usersMap.get(normEmail);
    if (existing) {
      user = existing;
    } else {
      user = {
        id: `usr-${Date.now().toString(36)}`,
        name: normEmail.split("@")[0].replace(/[._-]/g, " "),
        email: normEmail,
        role: "Emergency Responder / Hydrologist",
        organization: "Disaster Risk Assessment Agency",
        bio: "Remote sensing and hydrodynamic flood depth response personnel.",
        satelliteTier: "Sentinel-1 SAR IW Constellation Access",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      usersMap.set(normEmail, user);
      savePersistedUsers();
    }
  }

  return {
    success: true,
    message: "Identity verified successfully. Access granted.",
    user,
  };
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return usersMap.get(email.toLowerCase().trim());
}

export function authenticateWithPassword(
  email: string,
  password: string
): { success: boolean; message: string; user?: StoredUser } {
  const normEmail = email.toLowerCase().trim();
  const user = usersMap.get(normEmail);

  if (!user) {
    return {
      success: false,
      message: "No account found with this email. Please create an account first.",
    };
  }

  // If passwordHash exists, verify against sha256
  if (user.passwordHash) {
    const inputHash = hashPassword(password);
    if (inputHash !== user.passwordHash) {
      return {
        success: false,
        message: "Incorrect password. Please verify and try again.",
      };
    }
  } else {
    return {
      success: false,
      message: "Please reset your password or complete account registration.",
    };
  }

  return {
    success: true,
    message: `Welcome back, ${user.name}!`,
    user,
  };
}

export function saveUser(user: StoredUser): void {
  usersMap.set(user.email.toLowerCase().trim(), user);
  savePersistedUsers();
}
