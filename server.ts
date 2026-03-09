import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import path from "path";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory OTP storage
const otpStore: Record<string, { otp: string; expires: number }> = {};

// Nodemailer Transporter Initialization
const getEmailTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("Email credentials missing. OTP will be logged to console instead of sent via Email.");
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: { user, pass }
  });
};

// API Routes
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  };

  const transporter = getEmailTransporter();
  
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"BloodBank System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Verification Code - BloodBank",
        text: `Your verification code is: ${otp}. It is valid for 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #e11d48;">BloodBank Verification</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; margin: 20px 0;">${otp}</div>
            <p style="color: #666; font-size: 14px;">This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
      res.json({ success: true, message: "OTP sent to your email address." });
    } catch (error: any) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email. Check server logs." });
    }
  } else {
    // Fallback for development
    console.log(`[MOCK EMAIL] To: ${email} | Message: Your verification code is: ${otp}`);
    res.json({ 
      success: true, 
      message: "Email credentials missing. OTP logged to server console.",
      mock: true 
    });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ error: "No OTP found for this email" });
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }

  if (record.otp === otp) {
    delete otpStore[email];
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
