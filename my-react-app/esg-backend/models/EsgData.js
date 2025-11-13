const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;
const { sequelize } = require("../config/database");

const ESGData = sequelize.define("esg_data", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  environmentalScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  socialScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  governanceScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  complianceRate: { type: DataTypes.FLOAT },
  sustainabilityIndex: { type: DataTypes.STRING },
  sector: { type: DataTypes.STRING },
  region: { type: DataTypes.STRING },
  environmental: { type: DataTypes.TEXT },
  social: { type: DataTypes.TEXT },
  governance: { type: DataTypes.TEXT },
  userId: { type: DataTypes.STRING, defaultValue: 'admin@esgenius.com' },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
}, {
  timestamps: true,
  freezeTableName: true,
  indexes: [
    {
      fields: ['companyName']
    },
    {
      fields: ['year']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = ESGData;
