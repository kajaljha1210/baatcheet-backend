 
const express = require("express");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/send-otp", async (req, res) => {
  const { phone, otp } = req.body;

  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

  try {
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_NUMBER,
      to: phone,
    });
    res.json({ success: true, sid: message.sid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
