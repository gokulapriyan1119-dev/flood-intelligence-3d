import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode } from "@/utils/otpStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required for verification." },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return NextResponse.json(
        { success: false, message: "A valid 6-digit verification code is required." },
        { status: 400 }
      );
    }

    const result = verifyOtpCode(email, code.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to verify security code";
    console.error("[VERIFY-OTP ROUTE ERROR]", error);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
