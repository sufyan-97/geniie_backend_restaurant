const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantType = sequelize_conn.define('restaurant_types', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    restaurantId: { type: Sequelize.INTEGER, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false }
}, {
    timestamps: true,
})

module.exports = RestaurantType;