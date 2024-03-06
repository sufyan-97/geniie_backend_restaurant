const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const RestaurantTimeLap = require('./RestaurantTimeLaps');

const RestaurantTiming = sequelize_conn.define('restaurant_timings', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    day: { type: Sequelize.STRING, allowNull: false },
    restaurantId:{type:Sequelize.INTEGER},
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true
})

RestaurantTiming.hasMany(RestaurantTimeLap, {
    // foreignKey: 'restaurantTimingId',
    as: 'restaurant_time_laps'
})
// RestaurantTimeLap.belongsTo(RestaurantTimeLap)
module.exports = RestaurantTiming;