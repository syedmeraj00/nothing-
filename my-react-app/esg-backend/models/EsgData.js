const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ESGData = sequelize.define("esg_data", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  environmentalScore: { type: DataTypes.FLOAT, allowNull: false },
  socialScore: { type: DataTypes.FLOAT, allowNull: false },
  governanceScore: { type: DataTypes.FLOAT, allowNull: false },
  complianceRate: { type: DataTypes.FLOAT },
  sustainabilityIndex: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
}, {
  timestamps: false,
  freezeTableName: true,
});

module.exports = ESGData;
