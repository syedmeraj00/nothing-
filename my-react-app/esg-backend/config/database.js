const { Sequelize } = require('sequelize');

const useSQLite = process.env.USE_SQLITE === 'true';

const sequelize = new Sequelize(useSQLite ? {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
} : {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;