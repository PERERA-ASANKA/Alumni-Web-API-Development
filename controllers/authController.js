const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { User, EmailToken } = require('../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const domain = email.split('@')[1];
    if (domain !== process.env.UNIVERSITY_DOMAIN) {
      return res.status(400).json({ message: `Only @${process.env.UNIVERSITY_DOMAIN} emails allowed` });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({ email, password_hash });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await EmailToken.create({
      user_id:    user.id,
      token_hash: tokenHash,
      type:       'verification',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), 
    });

    await sendVerificationEmail(email, rawToken);

    res.status(201).json({ message: 'Registered! Please check your email to verify your account.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const record = await EmailToken.findOne({
      where: { token_hash: tokenHash, type: 'verification', used: false },
    });

    if (!record || record.expires_at < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    await User.update({ is_verified: true }, { where: { id: record.user_id } });
    await record.update({ used: true });

    res.json({ message: 'Email verified! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await EmailToken.create({
        user_id:    user.id,
        token_hash: tokenHash,
        type:       'password_reset',
        expires_at: new Date(Date.now() + 60 * 60 * 1000), 
      });

      await sendPasswordResetEmail(email, rawToken);
    }

    res.json({ message: 'Password reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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