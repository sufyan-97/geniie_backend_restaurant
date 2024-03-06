const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const { Restaurant } = require('./Restaurant');
const DashboardCard = require('./dashboardCard')

const RestaurantDashboardCard = sequelize_conn.define('restaurant_dashboard_cards', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dashboardCardId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
})

// RestaurantDashboardCard.belongsTo(Restaurant)
RestaurantDashboardCard.belongsTo(DashboardCard)

module.exports = RestaurantDashboardCard;