import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateOtp, findUserByEmail, hashPassword } from "@/utils/otpStore";
import { sendOtpVerificationEmail } from "@/utils/mailer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password, type = "signup" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normEmail = email.toLowerCase().trim();

    // Check if user already exists on signup
    const existingUser = findUserByEmail(normEmail);
    if (type === "signup" && existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists. Please proceed to Sign In.",
        },
        { status: 409 }
      );
    }

    // Optional check on login: if password was provided and user exists with passwordHash, verify
    if (type === "login" && existingUser && existingUser.passwordHash && password) {
      const computedHash = hashPassword(password);
      if (computedHash !== existingUser.passwordHash) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect password for this registered account.",
          },
          { status: 401 }
        );
      }
    }

    // Generate real cryptographic 6-digit OTP
    const { code, expiresAt } = createOrUpdateOtp(
      normEmail,
      type as "login" | "signup",
      type === "signup"
        ? {
            name: name?.trim() || normEmail.split("@")[0],
            email: normEmail,
            password,
          }
        : undefined
    );

    // Send real email via Nodemailer
    const emailResult = await sendOtpVerificationEmail({
      toEmail: normEmail,
      recipientName: name?.trim() || existingUser?.name || normEmail.split("@")[0],
      otpCode: code,
      purpose: type as "login" | "signup",
    });

    return NextResponse.json({
      success: true,
      message:
        emailResult.deliveredVia === "smtp"
          ? `Verification code dispatched to ${normEmail}. Check your inbox.`
          : emailResult.previewUrl
          ? `Verification code sent! View email preview in Ethereal test inbox.`
          : `Verification code generated for ${normEmail}.`,
      previewUrl: emailResult.previewUrl,
      deliveredVia: emailResult.deliveredVia,
      expiresAt,
      // For immediate convenience if running locally without custom SMTP
      demoCode: !process.env.SMTP_HOST ? code : undefined,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to generate security code";
    console.error("[SEND-OTP ROUTE ERROR]", error);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
