const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const LatLongRestaurant = require('./LatLongRestaurant');

const LatLong = sequelize_conn.define('lat_longs', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    lat: { type: Sequelize.STRING, allowNull: false },
    long: { type: Sequelize.STRING },
}, {
    timestamps: true,
})

LatLong.hasMany(LatLongRestaurant)

module.exports = LatLong;