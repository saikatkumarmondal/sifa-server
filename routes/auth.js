const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signupDataValidation } = require("../validation/validation");
const User = require("../database/user");
const verifyToken = require("../middlewares/verifyToken");
const authRouter = express.Router();
// signup
authRouter.post("/signup", async (req, res) => {
  try {
    signupDataValidation(req); // make sure this doesn't throw an error

    const { emailId, password } = req.body;

    // check required fields
    if (!emailId || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      emailId,
      password: hashedPassword,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser._id });
  } catch (error) {
    console.log("Signup error:", error); // log error for debugging
    res.status(500).json({ error: error.message });
  }
});

//login
authRouter.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    // Send cookie with proper options for cross-site login
    res.cookie("token", token, {
      httpOnly: true, // not accessible via JS
      sameSite: "lax", // allow cross-site requests
      secure: false, // must use HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, emailId: user.emailId, role: user.role },
      token: token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//logout
authRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
});
authRouter.get("/all", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

//GET current logged-in user
// GET /auth/me
authRouter.get("/me", verifyToken, async (req, res) => {
  res.status(200).json({
    id: req.user._id,
    emailId: req.user.emailId,
    role: req.user.role,
  });
});

// GET all users
authRouter.get("/all", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});
module.exports = authRouter;
