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
    signupDataValidation(req);
    if (!emailId || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "gfdhjfdsgjfdsgjgjfdggjfa983468468",
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        emailId: user.emailId,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.get("/all", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

//GET current logged-in user
authRouter.get("/me", verifyToken, async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user data
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all users
authRouter.get("/all", async (req, res) => {
  const users = await User.find({});
  res.send(users);
});
module.exports = authRouter;
