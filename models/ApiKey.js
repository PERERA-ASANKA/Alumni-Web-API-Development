const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ApiKey = sequelize.define('ApiKey', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  key_hash:   { type: DataTypes.STRING, allowNull: false, unique: true },
  is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  usage_count:  { type: DataTypes.INTEGER, defaultValue: 0 },     
  last_used_at: { type: DataTypes.DATE },
}, { tableName: 'api_keys', timestamps: true });

module.exports = ApiKey;