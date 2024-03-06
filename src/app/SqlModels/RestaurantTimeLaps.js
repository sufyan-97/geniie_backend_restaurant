const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantTimeLap = sequelize_conn.define('restaurant_time_laps', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    restaurantTimingId: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    restaurantId: {
        type: Sequelize.INTEGER
    },
    from: {
        type: Sequelize.STRING,
        allowNull: false
    },
    to: {
        type: Sequelize.STRING,
        allowNull: false
    },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true,
})



module.exports = RestaurantTimeLap;