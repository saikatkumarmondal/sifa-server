// middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
const User = require("../database/user");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "gfdhjfdsgjfdsgjgjfdggjfa983468468"
    );
    const user = await User.findById(decoded.userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res
      .status(401)
      .json({ message: "Invalid token or not authenticated" });
  }
};

module.exports = verifyToken;
