const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, DataTypes);

module.exports = {
  sequelize,
  User
};
