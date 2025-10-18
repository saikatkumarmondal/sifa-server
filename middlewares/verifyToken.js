// middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
const User = require("../database/user");

const verifyToken = async (req, res, next) => {
  try {
    // ✅ Get token from cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "gfdhjfdsgjfdsgjgjfdggjfa983468468"
    );

    const user = await User.findById(decoded.userId).select("-password").exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res
      .status(401)
      .json({ message: "Invalid token or not authenticated" });
  }
};

module.exports = verifyToken;
