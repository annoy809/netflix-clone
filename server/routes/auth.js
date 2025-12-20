const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("passport");
const authMiddleware = require("../middleware/authMiddleware");

// 🔐 Validate ENV
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.error("❌ GMAIL_USER or GMAIL_PASS not set");
  process.exit(1);
}

// ✉️ Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Send OTP
const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"KGN Centre" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your OTP for KGN Centre",
    html: `<h2>Your OTP is <b>${otp}</b></h2>`,
  });
};

// Send welcome/login email
const sendWelcomeEmail = async (email, type = "login") => {
  const subject =
    type === "signup" ? "Welcome to KGN Centre" : "Login Alert - KGN Centre";

  const html =
    type === "signup"
      ? `<h2>Welcome to <b>KGN Centre</b>!</h2><p>Your account has been created successfully.</p>`
      : `<h2>Hello from <b>KGN Centre</b>!</h2><p>You just logged in.</p>`;

  await transporter.sendMail({
    from: `"KGN Centre" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

// ✅ Verify Token
router.get("/verify-token", authMiddleware, async (req, res) => {
  res.json({ msg: "Token valid", user: req.user });
});

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirmPassword, phone } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ msg: "Passwords do not match" });

    if (password.length < 8)
      return res.status(400).json({ msg: "Password must be 8+ chars" });

    if (!/^[6-9]\d{9}$/.test(phone))
      return res.status(400).json({ msg: "Invalid Indian phone number" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ msg: "Email/Username already used" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
      otp,
    });

    await sendOTPEmail(email, otp);
    await sendWelcomeEmail(email, "signup");

    res.status(201).json({ msg: "Signup success, check OTP email" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({
        msg: "Email verified",
        token,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          picture: user.picture,
        },
      });
    } else {
      res.status(400).json({ msg: "Invalid OTP" });
    }
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Resend OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "Email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ msg: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  const isAdminEmail = email === process.env.ADMIN_EMAIL;
  const isAdminPass = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH
  );

  if (!user) {
    if (isAdminEmail && isAdminPass) {
      user = await User.create({
        username: "Admin",
        email,
        password: process.env.ADMIN_PASSWORD_HASH,
        role: "admin",
        isVerified: true,
      });
    } else return res.status(400).json({ msg: "User not found" });
  }

  if (!user.isVerified)
    return res.status(400).json({ msg: "Email not verified" });

  if (!isAdminEmail) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.json({
    msg: "Login successful",
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      profession: user.profession,
      skills: user.skills,
      website: user.website,
      linkedin: user.linkedin,
      profileImage: user.profileImage,
      phone: user.phone,
      location: user.location,
      jobTitle: user.jobTitle,
      picture: user.picture,
      role: user.role,
    },
  });
});

// 🟦 Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/auth?error=oauth-failed`,
  }),
  (req, res) => {
    const { token, user } = req.user;

    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      googleId: user.googleId,
      hasPassword: user.hasPassword || false,
      phone: user.phone || null,
      isVerified: user.isVerified,
    };

    const redirectUrl = `${process.env.CLIENT_URL}/?token=${token}&user=${encodeURIComponent(
      JSON.stringify(safeUser)
    )}`;

    res.redirect(redirectUrl);
  }
);

// 🟦 Admin Routes
router.get("/all-users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Access denied" });

  const users = await User.find({}, "-password -otp");
  res.json(users);
});

router.patch("/update-role/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Access denied" });

  const { role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );

  res.json({ msg: "Role updated", user });
});

router.delete("/remove-user/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Access denied" });

  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
});

// 🟦 Update profile
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const allowedUpdates = {
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio,
      profession: req.body.profession,
      skills: req.body.skills,
      website: req.body.website,
      linkedin: req.body.linkedin,
      profileImage: req.body.profileImage,
      phone: req.body.phone,
      location: req.body.location,
      jobTitle: req.body.jobTitle,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: allowedUpdates },
      { new: true, select: "-password -otp" }
    );

    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// 🟦 Get logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    res.json({ user: { ...user._doc } });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 🟦 Update user by ID
router.put("/update/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        jobTitle: req.body.jobTitle,
        phone: req.body.phone,
        address: req.body.address,
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
