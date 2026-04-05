const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (email, token) => {
  const url = `${process.env.BASE_URL}/api/auth/verify/${token}`;
  await transporter.sendMail({
    from:    `"Alumni Platform" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: 'Verify your email address',
    html:    `<p>Click the link below to verify your email:</p>
              <a href="${url}">${url}</a>
              <p>This link expires in 24 hours.</p>`,
  });
};

exports.sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.BASE_URL}/api/auth/reset-password/${token}`;
  await transporter.sendMail({
    from:    `"Alumni Platform" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: 'Reset your password',
    html:    `<p>Click the link below to reset your password:</p>
              <a href="${url}">${url}</a>
              <p>This link expires in 1 hour. If you didn't request this, ignore it.</p>`,
  });
};