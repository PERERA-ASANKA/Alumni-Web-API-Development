const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:             { type: DataTypes.INTEGER, allowNull: false },
  full_name:           { type: DataTypes.STRING },
  bio:                 { type: DataTypes.TEXT },
  linkedin_url:        { type: DataTypes.STRING },
  profile_image:       { type: DataTypes.STRING },
  is_active:           { type: DataTypes.BOOLEAN, defaultValue: false },
  monthly_appearances: { type: DataTypes.INTEGER, defaultValue: 0 },
  attended_event:      { type: DataTypes.BOOLEAN, defaultValue: false },
  month_reset_at:      { type: DataTypes.DATE },
}, { tableName: 'profiles', timestamps: true });

module.exports = Profile;