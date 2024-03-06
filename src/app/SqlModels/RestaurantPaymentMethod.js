const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantPaymentMethods = sequelize_conn.define('restaurant_payment_methods', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    image: { type: Sequelize.STRING, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true,
})



module.exports = RestaurantPaymentMethods;