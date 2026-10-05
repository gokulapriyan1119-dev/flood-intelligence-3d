import nodemailer, { type Transporter, type TestAccount } from "nodemailer";

interface SendOtpEmailParams {
  toEmail: string;
  recipientName?: string;
  otpCode: string;
  purpose: "login" | "signup";
}

export interface SendOtpEmailResult {
  success: boolean;
  message: string;
  previewUrl?: string | null;
  deliveredVia: "smtp" | "ethereal" | "simulation";
}

let cachedTransporter: Transporter | null = null;
let cachedTestAccount: TestAccount | null = null;

async function getTransporter(): Promise<{
  transporter: Transporter;
  mode: "smtp" | "ethereal" | "simulation";
  fromAddress: string;
}> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.SMTP_FROM || (user ? `Flood Intelligence <${user}>` : `"Flood Intelligence Security" <security@flood-intelligence.org>`);

  // 1. If explicit SMTP credentials are provided, use them
  if (host && user && pass) {
    if (!cachedTransporter) {
      cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
    }
    return { transporter: cachedTransporter, mode: "smtp", fromAddress: from };
  }

  // 2. Otherwise try creating or reusing an Ethereal test inbox
  try {
    if (!cachedTestAccount) {
      cachedTestAccount = await nodemailer.createTestAccount();
      console.log(`[MAILER] Created ephemeral Ethereal test account: ${cachedTestAccount.user}`);
    }

    const testTransporter = nodemailer.createTransport({
      host: cachedTestAccount.smtp.host,
      port: cachedTestAccount.smtp.port,
      secure: cachedTestAccount.smtp.secure,
      auth: {
        user: cachedTestAccount.user,
        pass: cachedTestAccount.pass,
      },
    });

    return {
      transporter: testTransporter,
      mode: "ethereal",
      fromAddress: `"Flood Intelligence System" <${cachedTestAccount.user}>`,
    };
  } catch (err) {
    console.warn("[MAILER] Could not initialize Ethereal test account:", err);
    // 3. Fallback to json transport
    const jsonTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return {
      transporter: jsonTransporter,
      mode: "simulation",
      fromAddress: `"Flood Intelligence 3D" <noreply@flood-intelligence.org>`,
    };
  }
}

export async function sendOtpVerificationEmail({
  toEmail,
  recipientName = "Researcher",
  otpCode,
  purpose,
}: SendOtpEmailParams): Promise<SendOtpEmailResult> {
  try {
    const { transporter, mode, fromAddress } = await getTransporter();

    const subject =
      purpose === "signup"
        ? `[${otpCode}] Complete Your Flood Intelligence Account Registration`
        : `[${otpCode}] Your Flood Intelligence Two-Factor Security Code`;

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body {
      background-color: #030712;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 580px;
      margin: 32px auto;
      background: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #091322 0%, #0e1e38 100%);
      padding: 28px;
      border-bottom: 1px solid rgba(6, 182, 212, 0.2);
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid #06b6d4;
      border-radius: 20px;
      color: #00f3ff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 8px 0 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #ffffff;
    }
    .content {
      padding: 32px 28px;
    }
    .otp-box {
      margin: 24px 0;
      background: #030712;
      border: 1px solid #06b6d4;
      border-radius: 12px;
      padding: 22px;
      text-align: center;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
    }
    .otp-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 12px;
      color: #00f3ff;
      margin: 0;
    }
    .notice {
      background: rgba(15, 23, 42, 0.7);
      border-left: 3px solid #06b6d4;
      padding: 12px 16px;
      margin: 20px 0;
      font-size: 12px;
      line-height: 1.6;
      color: #94a3b8;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      background: #050b14;
      padding: 20px 28px;
      border-top: 1px solid #1e293b;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">🛰️ FLOOD INTELLIGENCE 3D</div>
      <h1>Sentinel-1 SAR Verification</h1>
    </div>
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
        ${
          purpose === "signup"
            ? "Thank you for creating an account on the Flood Intelligence 3D Platform. To confirm your identity and grant access to the Copernicus Sentinel-1 satellite flood hydrodynamics engine, please enter the following verification code:"
            : "A security verification was requested for your Flood Intelligence 3D session. Enter the code below to complete authentication:"
        }
      </p>

      <div class="otp-box">
        <div class="otp-label">Security One-Time Passcode</div>
        <div class="otp-code">${otpCode}</div>
      </div>

      <div class="notice">
        <strong>⏱️ Expiration Notice:</strong> This 6-digit passcode is active for <strong>10 minutes</strong>.<br>
        <strong>🔒 Security Advisory:</strong> Do not share this code with anyone. System operators will never request your verification token.
      </div>

      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
        If you did not initiate this request, you can safely disregard this email.
      </p>
    </div>
    <div class="footer">
      <div>Global Disaster Alert & Coordination System (GDACS) &bull; Copernicus Emergency Management</div>
      <div style="margin-top: 4px;">Physics-Informed Deep Remote Sensing Hydrological Intelligence</div>
    </div>
  </div>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text: `Your Flood Intelligence 3D verification code is: ${otpCode}. It will expire in 10 minutes.`,
      html: htmlBody,
    });

    let previewUrl: string | null = null;
    if (mode === "ethereal") {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
      console.log(`=======================================================`);
      console.log(`[EMAIL DISPATCHED VIA ETHEREAL]`);
      console.log(`To: ${toEmail}`);
      console.log(`OTP Code: ${otpCode}`);
      if (previewUrl) {
        console.log(`Live Email Preview URL: ${previewUrl}`);
      }
      console.log(`=======================================================`);
    } else if (mode === "smtp") {
      console.log(`=======================================================`);
      console.log(`[EMAIL DISPATCHED VIA REAL SMTP]`);
      console.log(`To: ${toEmail}`);
      console.log(`OTP Code: ${otpCode}`);
      console.log(`Message ID: ${info.messageId}`);
      console.log(`=======================================================`);
    } else {
      console.log(`=======================================================`);
      console.log(`[EMAIL SIMULATED - NO SMTP CONFIG]`);
      console.log(`To: ${toEmail}`);
      console.log(`OTP Code: ${otpCode}`);
      console.log(`=======================================================`);
    }

    return {
      success: true,
      message: `Verification code sent to ${toEmail}`,
      previewUrl,
      deliveredVia: mode,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to send verification email";
    console.error("[MAILER ERROR]", error);
    return {
      success: false,
      message: errorMsg,
      deliveredVia: "simulation",
    };
  }
}
