import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

// ===============================
// REGISTER
// ===============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const userExists = await User.exists({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "User exists",
      });
    }

    // User model pre-save hook handles bcrypt hashing
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // Generate token immediately
    const token = generateToken(user._id);

    // Login immediately after signup
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget || 0,
      token,
    });
  } catch (err) {
    // Handle duplicate email race condition
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    console.error("Register error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// LOGIN
// ===============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Only retrieve fields required for authentication
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // bcrypt comparison
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget || 0,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({
      validateBeforeSave: false,
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Keep email sending here because this is password recovery,
    // not normal signup/login.
    await sendEmail({
      to: user.email,
      subject: "SpendWise Password Reset",
      html: `<p>Reset here: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    return res.json({
      message: "Reset email sent",
    });
  } catch (err) {
    console.error("Forgot password backend error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const resetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // User pre-save hook hashes the password
    await user.save();

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Reset password error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both passwords required",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Pre-save hook will hash it
    user.password = newPassword;

    await user.save();

    return res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// UPDATE PROFILE
// ===============================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const oldName = user.name;

    user.name = req.body.name?.trim() || user.name;

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      oldName,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
