const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Employment = sequelize.define('Employment', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  profile_id: { type: DataTypes.INTEGER, allowNull: false },
  company:    { type: DataTypes.STRING },
  role:       { type: DataTypes.STRING },
  industry:   { type: DataTypes.STRING },
  location:   { type: DataTypes.STRING },
  start_date: { type: DataTypes.DATEONLY },
  end_date:   { type: DataTypes.DATEONLY }, 
}, { tableName: 'employment', timestamps: true });

module.exports = Employment;