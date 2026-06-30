const express = require("express");
const router = express.Router();
const Subscriber = require("../model/subscriberModel");
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    // Step 1: DB me save karo (ye fail nahi hona chahiye agar yahan tak pahunche)
    await Subscriber.create({ email: normalizedEmail });

    // Step 2: Admin ko notification bhejo (admin@barosche.com ke mailbox me)
    const adminMailResult = await sendEmail({
      to: "admin@barosche.com",
      subject: "New Newsletter Subscriber",
      html: `
        <h2>New Subscriber 🎉</h2>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p>Subscribed at: ${new Date().toLocaleString()}</p>
      `,
    });

    // Step 3: User ko welcome mail bhejo
    const userMailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Welcome to Barosche Newsletter",
      html: `
        <h2>Thank you for subscribing!</h2>
        <p>You'll now receive updates on our latest collections and offers.</p>
      `,
    });

    // Agar dono mail fail ho jaayein, tab bhi subscriber save ho chuka hai
    // isliye success hi bhejna sahi hai, lekin warn karo console me
    if (!adminMailResult.success) {
      console.warn("⚠️ Admin notification email failed:", adminMailResult.error);
    }
    if (!userMailResult.success) {
      console.warn("⚠️ Welcome email to user failed:", userMailResult.error);
    }

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully!",
    });
  } catch (error) {
    console.error("Subscribe error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

module.exports = router;