const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const { Restaurant } = require('./Restaurant');

const LatLongRestaurant = sequelize_conn.define('lat_long_restaurants', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }
}, {
    timestamps: true,
})

LatLongRestaurant.belongsTo(Restaurant)

module.exports = LatLongRestaurant;