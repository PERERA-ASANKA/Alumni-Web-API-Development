const crypto  = require('crypto');
const { ApiKey, ApiKeyLog } = require('../models');

// ─────────────────────────────────────────
// POST /api/keys — generate a new API key
// ─────────────────────────────────────────
exports.generateKey = async (req, res) => {
  try {
    // Generate a secure random key with a readable prefix
    const rawKey  = `alum_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKey.create({
      user_id:  req.user.id,
      key_hash: keyHash,
    });

    // IMPORTANT: Return the raw key NOW — it is never stored, only the hash is.
    // The user must copy it here because it cannot be retrieved again.
    res.status(201).json({
      message: 'API key generated successfully. Copy it now — it will NOT be shown again.',
      key:     rawKey,
      id:      apiKey.id,
      created_at: apiKey.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// GET /api/keys — list all your API keys
// ─────────────────────────────────────────
exports.listKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      where: { user_id: req.user.id },
      // Never return key_hash — only metadata
      attributes: ['id', 'is_revoked', 'usage_count', 'last_used_at', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({ total: keys.length, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// GET /api/keys/:id/stats — usage logs
// ─────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      attributes: ['id', 'is_revoked', 'usage_count', 'last_used_at', 'createdAt'],
      include: [
        {
          model: ApiKeyLog,
          attributes: ['endpoint', 'method', 'ip', 'createdAt'],
          order:      [['createdAt', 'DESC']],
          limit:      100,
        },
      ],
    });

    if (!apiKey) return res.status(404).json({ message: 'API key not found' });

    res.json({
      key_id:       apiKey.id,
      is_revoked:   apiKey.is_revoked,
      usage_count:  apiKey.usage_count,
      last_used_at: apiKey.last_used_at,
      created_at:   apiKey.createdAt,
      recent_logs:  apiKey.ApiKeyLogs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// PATCH /api/keys/:id/revoke — revoke a key
// ─────────────────────────────────────────
exports.revokeKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!apiKey) return res.status(404).json({ message: 'API key not found' });
    if (apiKey.is_revoked) return res.status(400).json({ message: 'Key is already revoked' });

    await apiKey.update({ is_revoked: true });

    res.json({ message: 'API key revoked successfully. It can no longer be used.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};