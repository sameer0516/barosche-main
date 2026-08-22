const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "jewellery_secret_key", {
    expiresIn: "7d",
  });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const deriveNameFromEmail = (email) => {
  const localPart = email.split("@")[0];
  const cleaned = localPart
    .replace(/[._\-+]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return cleaned || "Customer";
};

const safeSendEmail = async (payload, label) => {
  try {
    await sendEmail(payload);
    console.log(`[Mail Sent] ${label} -> ${payload.to}`);
  } catch (err) {
    console.error(`[Mail Failed] ${label} -> ${payload.to}:`, err.message);
  }
};

const fireAndForgetEmail = (payload, label) => {
  safeSendEmail(payload, label);
};

const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        title: "Mr.",
        firstName: deriveNameFromEmail(normalizedEmail),
        lastName: "",
        email: normalizedEmail,
        isVerified: false,
      });
      isNewUser = true;
    }

    const otp = generateOTP();
    user.authOTP = otp;
    user.authOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email}`,
      isNewUser,
    });

    fireAndForgetEmail(
      {
        to: user.email,
        subject: isNewUser ? "Verify your email - Barosche" : "Your login OTP - Barosche",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${isNewUser ? "Welcome to Barosche!" : "Login Verification"}</h2>
            <p>Hi ${user.firstName},</p>
            <p>Your 6-digit OTP code is:</p>
            <h1 style="letter-spacing: 8px;">${otp}</h1>
            <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      },
      "OTP Mail"
    );
  } catch (error) {
    console.error("Request OTP Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  }
};

// ────────────────────────────────────────────────────────────
// STEP 2: Verify OTP -> account activate + login
// ────────────────────────────────────────────────────────────
const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.authOTP || user.authOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.authOTPExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const wasNewUser = !user.isVerified;

    user.isVerified = true;
    user.authOTP = null;
    user.authOTPExpire = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: wasNewUser ? "Account created successfully!" : `Welcome back, ${user.firstName}!`,
      token,
      user: {
        _id: user._id,
        title: user.title,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });

    const customerName = `${user.firstName} ${user.lastName}`.trim();
    const registrationDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    if (wasNewUser) {
      fireAndForgetEmail(
        {
          to: user.email,
          subject: "Welcome to Barosché — Your Account is Ready",
          html: `
            <div style="font-family: Georgia, 'Times New Roman', serif; padding: 30px; max-width: 600px; margin: 0 auto; color: #222;">
              <p>Hello ${user.firstName},</p>
              <p>Your Barosché account is now created.</p>
              <p>At Barosché, we design fine jewellery for today—not for occasions, but for life as it is. What you choose to wear does not need a reason, a milestone, or a moment of permission. It is already yours.</p>
              <p>Begin here: <a href="https://barosche.com/" style="color: #a67c52;">https://barosche.com/</a></p>
              <p>You can now:</p>
              <ul>
                <li>Explore pieces made for everyday presence</li>
                <li>Save what feels right to you</li>
                <li>Choose without waiting for an occasion</li>
              </ul>
              <p>If you need any assistance, we are here.</p>
              <p><em>For today.</em></p>
              <p>Warm regards,<br/>
              Team Barosché<br/>
              info@barosche.com</p>
            </div>
          `,
        },
        "Welcome Mail (Customer)"
      );

      fireAndForgetEmail(
        {
          to: process.env.CONTACT_RECEIVER,
          subject: "New User Registration on Barosche",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <p>Hello Admin,</p>
              <p>A new user has successfully created an account on your website.</p>
              <p>Here are the registration details:</p>
              <p>
                Name: ${customerName}<br/>
                Email: ${user.email}<br/>
                Phone: ${user.phone || "Not Provided"}<br/>
                Registration Date: ${registrationDate}
              </p>
              <p>You can view or manage this user from your admin dashboard.</p>
              <p>Please ensure timely engagement for better customer experience.</p>
              <p>Best regards,<br/>Barosche Website System</p>
            </div>
          `,
        },
        "New Registration Alert (Admin)"
      );
    } else {
      fireAndForgetEmail(
        {
          to: user.email,
          subject: "Login Successful - Barosche",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Welcome back!</h2>
              <p>Hi ${user.firstName},</p>
              <p>You have successfully logged in to your Barosche account.</p>
              <p><strong>Time:</strong> ${registrationDate}</p>
            </div>
          `,
        },
        "Login Confirmation (Customer)"
      );
    }
  } catch (error) {
    console.error("Verify OTP Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  }
};

const resendAuthOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOTP();
    user.authOTP = otp;
    user.authOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.status(200).json({ success: true, message: "OTP resent successfully." });

    fireAndForgetEmail(
      {
        to: user.email,
        subject: "Your new OTP - Barosche",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <p>Hi ${user.firstName},</p>
            <p>Your new OTP code is:</p>
            <h1 style="letter-spacing: 8px;">${otp}</h1>
            <p>Valid for 10 minutes.</p>
          </div>
        `,
      },
      "Resend OTP Mail"
    );
  } catch (error) {
    console.error("Resend OTP Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -authOTP -resetPasswordOTP");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const logoutUser = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "First name, last name and email are required.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail !== user.email) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: "This email is already in use." });
      }
      user.email = normalizedEmail;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone || user.phone;

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -authOTP -resetPasswordOTP"
    );

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ────────────────────────────────────────────────────────────
// UPDATE ADDRESS
// ────────────────────────────────────────────────────────────
const updateAddress = async (req, res) => {
  try {
    const { line1, line2, city, state, postalCode, country, phone } = req.body;

    if (!line1 || !city || !postalCode || !country) {
      return res.status(400).json({
        success: false,
        message: "Address line, city, postal code and country are required.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.address = { line1, line2, city, state, postalCode, country, phone };

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -authOTP -resetPasswordOTP"
    );

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = {
  requestOTP,
  verifyLoginOTP,
  resendAuthOTP,
  getMe,
  logoutUser,
  updateProfile,
  updateAddress,
};