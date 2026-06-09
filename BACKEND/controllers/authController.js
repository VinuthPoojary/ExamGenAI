const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../services/emailService');

/**
 * Generate JWT token for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register new student
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Validate request body fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user (password hashed automatically via pre-save hook)
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login student
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    // Find user and explicitly include password (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password using bcrypt compare
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with that email exists',
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP & Expiry (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Send Email
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0;">ExamGen AI Pro</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Smart Document Assessment Platform</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Please use the following One-Time Password (OTP) to complete the request. This OTP is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px; border: 1px dashed #cbd5e1; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p>If you did not request this password reset, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">&copy; 2026 ExamGen AI Pro. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: '[ExamGen AI Pro] Password Reset OTP',
        html,
        text: `Hello ${user.name},\n\nYour OTP to reset password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      });

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your email',
      });
    } catch (err) {
      // Clear OTP if sending fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(err);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with that email exists',
      });
    }

    // Verify OTP and check expiration
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code',
      });
    }

    if (user.resetPasswordOTPExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
