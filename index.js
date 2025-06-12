const express = require("express");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory store for OTPs (phone -> { otp, expiry })
const otpStore = {};

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// ✅ Send OTP
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ error: "Phone number is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore[phone] = { otp, expiry };

  try {
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_NUMBER,
      to: phone,
    });

    res.json({ success: true, sid: message.sid, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Verify OTP
app.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  const storedData = otpStore[phone];

  if (!storedData) {
    return res.status(400).json({ error: "OTP not found. Please request again." });
  }

  if (Date.now() > storedData.expiry) {
    delete otpStore[phone];
    return res.status(400).json({ error: "OTP expired. Please request again." });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  delete otpStore[phone]; // OTP used once
  res.json({ success: true, message: "OTP verified successfully" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
