const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ApiKeyLog = sequelize.define('ApiKeyLog', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  api_key_id: { type: DataTypes.INTEGER, allowNull: false },
  endpoint:   { type: DataTypes.STRING },
  method:     { type: DataTypes.STRING(10) },
  ip:         { type: DataTypes.STRING },
}, { tableName: 'api_key_logs', timestamps: true });

module.exports = ApiKeyLog;