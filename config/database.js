const { Sequelize } = require('sequelize');
const constants = require('./constants')

const sequelize = new Sequelize(constants.DB_NAME, constants.DB_USERNAME, constants.DB_PASSWORD, {
    host: constants.DB_HOST,
    dialect: 'mysql',
    logging: false
})

module.exports = {
    sequelize_conn: sequelize
}