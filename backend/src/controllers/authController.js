import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import User from '../models/User.js';

import bcrypt from 'bcryptjs';
import {generateToken} from '../utils/generateToken.js';
import {isValidEmailDomain} from '../utils/emailValidator.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  const {name, email, password} = req.body;

  const userExists = await User.findOne ({email});
  if (userExists) {
    return res.status (400).json ({message: 'User exists'});
  }

  // 🔥 DO NOT hash here
  const user = await User.create ({
    name,
    email,
    password, // 👈 plain password
  });

  res.status (201).json ({
    _id: user._id,
    email: user.email,
    token: generateToken (user._id),
  });
};

//login user
export const loginUser = async (req, res) => {
  const {email, password} = req.body;

  const user = await User.findOne ({email}).select ('+password'); // 👈 IMPORTANT
  if (!user) {
    return res.status (400).json ({message: 'Invalid credentials'});
  }

  const isMatch = await user.matchPassword (password);
  // console.log ('👉 Password match result:', isMatch);

  if (!isMatch) {
    return res.status (400).json ({message: 'Invalid credentials'});
  }

  const token = jwt.sign ({id: user._id}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.json ({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget || 0,
    },
  });
};

// ✉️ Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const {email} = req.body;

    const user = await User.findOne ({email});
    if (!user) return res.status (404).json ({message: 'User not found'});

    const resetToken = crypto.randomBytes (20).toString ('hex');

    user.resetPasswordToken = crypto
      .createHash ('sha256')
      .update (resetToken)
      .digest ('hex');

    user.resetPasswordExpire = Date.now () + 15 * 60 * 1000;

    await user.save ({validateBeforeSave: false});

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail ({
      to: user.email,
      subject: 'SpendWise Password Reset',
      html: `<p>Reset here: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json ({message: 'Reset email sent'});
  } catch (err) {
    console.error ('Forgot password backend error:', err); // 👈 THIS IS KEY
    res.status (500).json ({message: 'Server error'});
  }
};

// 🔁 Reset password
export const resetPassword = async (req, res) => {
  const resetToken = crypto
    .createHash ('sha256')
    .update (req.params.token)
    .digest ('hex');

  const user = await User.findOne ({
    resetPasswordToken: resetToken,
    resetPasswordExpire: {$gt: Date.now ()},
  });

  if (!user)
    return res.status (400).json ({message: 'Invalid or expired token'});

  const salt = await bcrypt.genSalt (10);
  user.password = await bcrypt.hash (req.body.password, salt);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save ();

  res.json ({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};
// 🔒 Change password
export const changePassword = async (req, res) => {
  try {
    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
      return res.status (400).json ({message: 'Both passwords required'});
    }

    const user = await User.findById (req.user._id).select ('+password');

    const isMatch = await bcrypt.compare (currentPassword, user.password);
    if (!isMatch) {
      return res.status (401).json ({message: 'Current password is incorrect'});
    }

    user.password = await bcrypt.hash (newPassword, 10);
    await user.save ();

    res.json ({message: 'Password updated successfully'});
  } catch (err) {
    res.status (500).json ({message: err.message});
  }
};
// 👤 Update profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById (req.user._id);

    const oldName = user.name; // 👈 store old name

    user.name = req.body.name || user.name;
    await user.save ();

    res.json ({
      message: 'Profile updated successfully',
      oldName,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status (500).json ({message: err.message});
  }
};
