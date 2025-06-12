const express = require("express");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// ✅ Send OTP using Twilio Verify API
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required",
    });
  }

  try {
    const verification = await client.verify
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    res.status(200).json({
      success: true,
      data: {
        status: verification.status,
        message: "OTP sent successfully",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send OTP",
    });
  }
});

// ✅ Verify OTP using Twilio Verify API
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      error: "Phone number and OTP are required",
    });
  }

  try {
    const verificationCheck = await client.verify
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      return res.status(200).json({
        success: true,
        data: {
          verified: true,
          message: "OTP verified successfully",
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify OTP",
    });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
