const jwt = require("jsonwebtoken");
const User = require("../database/user");

const verifyToken = async (req, res, next) => {
  // 1. Get the Authorization header (e.g., "Bearer YOUR_TOKEN")
  const authHeader = req.headers.authorization;

  // Check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Invalid token or not authenticated" });
  }

  // 2. Extract the actual token (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // 4. Find the user and attach to the request
    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    // This catches JWT errors (e.g., token expired, invalid signature)
    return res
      .status(401)
      .json({ message: "Invalid token or not authenticated" });
  }
};

module.exports = verifyToken;
