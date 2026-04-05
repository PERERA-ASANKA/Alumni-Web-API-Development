const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appearance = sequelize.define('Appearance', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  profile_id:      { type: DataTypes.INTEGER, allowNull: false },
  bid_id:          { type: DataTypes.INTEGER },
  appearance_date: { type: DataTypes.DATEONLY, allowNull: false },
}, { tableName: 'appearances', timestamps: true });

module.exports = Appearance;