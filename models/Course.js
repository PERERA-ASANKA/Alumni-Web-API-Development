const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  profile_id:      { type: DataTypes.INTEGER, allowNull: false },
  title:           { type: DataTypes.STRING },
  provider:        { type: DataTypes.STRING },
  url:             { type: DataTypes.STRING },
  completion_date: { type: DataTypes.DATEONLY },
}, { tableName: 'courses', timestamps: true });

module.exports = Course;