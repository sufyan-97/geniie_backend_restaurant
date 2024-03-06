const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const OrderHistory = sequelize_conn.define('order_history', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    orderId: { type: Sequelize.INTEGER, allowNull: false },

    // action: { type: Sequelize.ENUM, values: ['created', 'accepted_by_restaurant', 'declined_by_restaurant', 'fulfilled_by_restaurant', 'order_completed', 'picked_by_rider', 'delivered_by_rider', 'picked_by_user'], allowNull: false },
    action: { type: Sequelize.STRING, allowNull: false },

    actionData: { type: Sequelize.JSON },
}, {
    timestamps: true,
    freezeTableName: true
})

module.exports = OrderHistory;