const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ESGModel = sequelize.define('ESGModel', {
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Environmental metrics
  environmentalScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  co2Reduction: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // Social metrics
  socialScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Governance metrics
  governanceScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Overall metrics
  esgScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  complianceRate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  sustainabilityIndex: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Metadata
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: 'esg_data',
  timestamps: true, // Enable automatic timestamp management
});

module.exports = ESGModel;
