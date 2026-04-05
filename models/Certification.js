const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certification = sequelize.define('Certification', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  profile_id:      { type: DataTypes.INTEGER, allowNull: false },
  title:           { type: DataTypes.STRING },
  issuer:          { type: DataTypes.STRING },
  url:             { type: DataTypes.STRING },
  completion_date: { type: DataTypes.DATEONLY },
}, { tableName: 'certifications', timestamps: true });

module.exports = Certification;