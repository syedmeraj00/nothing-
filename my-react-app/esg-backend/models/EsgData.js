const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;
const db = require("../config/db");
const sequelize = db.sequelize;

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
  indexes: [
    {
      fields: ['companyName']
    },
    {
      fields: ['year']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['companyName', 'year'],
      unique: true
    }
  ]
});

module.exports = ESGData;
