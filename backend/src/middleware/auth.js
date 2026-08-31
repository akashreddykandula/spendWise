import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password").lean();

    // JWT is valid but user doesn't exist anymore
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("JWT error:", err.message);

    return res.status(401).json({
      message: "Token invalid",
    });
  }
};
