const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bid = sequelize.define('Bid', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:     { type: DataTypes.INTEGER, allowNull: false },
  amount:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  target_date: { type: DataTypes.DATEONLY, allowNull: false },
  status:      {
    type: DataTypes.ENUM('pending', 'winning', 'losing', 'won', 'lost'),
    defaultValue: 'pending',
  },
}, { tableName: 'bids', timestamps: true });

module.exports = Bid;