const crypto = require('crypto');
const { ApiKey, User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'API key required as Bearer token' });
    }

    const rawKey = header.split(' ')[1];
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKey.findOne({
      where: { key_hash: keyHash, is_revoked: false },
      include: [User],
    });

    if (!apiKey) return res.status(403).json({ message: 'Invalid or revoked API key' });

    req.apiKey = apiKey;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};