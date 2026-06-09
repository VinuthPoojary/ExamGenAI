const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
];

const resetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit number'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Routes
router.post('/register',        registerValidation,       register);
router.post('/login',           loginValidation,          login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password',  resetPasswordValidation,  resetPassword);
router.get('/me',               protect,                  getMe);

module.exports = router;
