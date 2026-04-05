const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { User, EmailToken } = require('../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check university domain
    const domain = email.split('@')[1];
    if (domain !== process.env.UNIVERSITY_DOMAIN) {
      return res.status(400).json({ message: `Only @${process.env.UNIVERSITY_DOMAIN} emails allowed` });
    }

    // 2. Check if already registered
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    // 3. Hash password (12 salt rounds = secure)
    const password_hash = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await User.create({ email, password_hash });

    // 5. Create a secure verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await EmailToken.create({
      user_id:    user.id,
      token_hash: tokenHash,
      type:       'verification',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // 6. Send verification email
    await sendVerificationEmail(email, rawToken);

    res.status(201).json({ message: 'Registered! Please check your email to verify your account.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/verify/:token
exports.verifyEmail = async (req, res) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const record = await EmailToken.findOne({
      where: { token_hash: tokenHash, type: 'verification', used: false },
    });

    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    // Mark user as verified, mark token as used
    await User.update({ is_verified: true }, { where: { id: record.user_id } });
    await record.update({ used: true });

    res.json({ message: 'Email verified! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    // Use same error message for both wrong email and wrong password
    // This prevents attackers from knowing which one is wrong
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always respond the same way whether user exists or not (prevents email enumeration)
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await EmailToken.create({
        user_id:    user.id,
        token_hash: tokenHash,
        type:       'password_reset',
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      await sendPasswordResetEmail(email, rawToken);
    }

    res.json({ message: 'Password reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const record = await EmailToken.findOne({
      where: { token_hash: tokenHash, type: 'password_reset', used: false },
    });

    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await User.update({ password_hash }, { where: { id: record.user_id } });
    await record.update({ used: true });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};