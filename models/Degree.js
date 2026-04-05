const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Degree = sequelize.define('Degree', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  profile_id:      { type: DataTypes.INTEGER, allowNull: false },
  title:           { type: DataTypes.STRING },
  university:      { type: DataTypes.STRING },
  url:             { type: DataTypes.STRING },
  completion_date: { type: DataTypes.DATEONLY },
}, { tableName: 'degrees', timestamps: true });

module.exports = Degree;