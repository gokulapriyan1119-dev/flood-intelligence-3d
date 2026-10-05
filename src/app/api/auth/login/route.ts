import { NextRequest, NextResponse } from "next/server";
import { authenticateWithPassword } from "@/utils/otpStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Password is required to sign in." },
        { status: 400 }
      );
    }

    const result = authenticateWithPassword(email, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Authentication error occurred";
    console.error("[LOGIN ROUTE ERROR]", error);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
