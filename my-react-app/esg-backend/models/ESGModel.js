const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ESGModel = sequelize.define('ESGModel', {
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  esgScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  co2Reduction: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  complianceRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  sustainabilityIndex: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'esg_data', // match your DB table name
  timestamps: false,
});

module.exports = ESGModel;
