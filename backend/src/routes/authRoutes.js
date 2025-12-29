import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {updateProfile, changePassword} from '../controllers/authController.js';

import {protect} from '../middleware/auth.js';
const router = express.Router ();

router.post ('/register', registerUser);
router.post ('/login', loginUser);
router.post ('/forgot-password', forgotPassword);
router.post ('/reset-password/:token', resetPassword);
router.put ('/update-profile', protect, updateProfile);
router.put ('/change-password', protect, changePassword);

export default router;
