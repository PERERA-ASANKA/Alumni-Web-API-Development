const crypto  = require('crypto');
const { ApiKey, ApiKeyLog } = require('../models');

exports.generateKey = async (req, res) => {
  try {
    const { name } = req.body || {};
    
    if (!name) {
      return res.status(400).json({ message: 'API key name is required' });
    }

    const rawKey  = `key_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKey.create({
      user_id: req.user.id,
      name,
      key_hash: keyHash,
    });

    res.status(201).json({
      message: 'API key generated successfully. Copy it now — it will NOT be shown again.',
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      created_at: apiKey.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'name', 'is_revoked', 'usage_count', 'last_used_at', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({ 
      total: keys.length, 
      keys: keys.map(k => ({
        id: k.id,
        name: k.name,
        isRevoked: k.is_revoked,
        status: k.is_revoked ? 'revoked' : 'active',
        usageCount: k.usage_count,
        lastUsedAt: k.last_used_at,
        createdAt: k.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateKey = async (req, res) => {
  try {
    const { name } = req.body || {};
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!apiKey) return res.status(404).json({ message: 'API key not found' });

    const updates = {};
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'API key name is required' });
      updates.name = name.trim();
    }

    await apiKey.update(updates);

    res.json({
      message: 'API key updated successfully',
      key: {
        id: apiKey.id,
        name: apiKey.name,
        isRevoked: apiKey.is_revoked,
        status: apiKey.is_revoked ? 'revoked' : 'active',
        usageCount: apiKey.usage_count,
        lastUsedAt: apiKey.last_used_at,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!apiKey) return res.status(404).json({ message: 'API key not found' });

    await apiKey.destroy();
    res.json({ message: 'API key deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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