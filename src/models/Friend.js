const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friend = sequelize.define('Friend', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'Friends',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'friendId']
    }
  ]
});

module.exports = Friend;