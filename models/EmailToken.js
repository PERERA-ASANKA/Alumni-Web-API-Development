const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmailToken = sequelize.define('EmailToken', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: false },
  token_hash: { type: DataTypes.STRING, allowNull: false },
  type:       { type: DataTypes.ENUM('verification', 'password_reset'), allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  used:       { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'email_tokens', timestamps: true });

module.exports = EmailToken;