const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const { Restaurant } = require('./Restaurant');
const DashboardCard = require('./dashboardCard');

const Cart = sequelize_conn.define('carts', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: Sequelize.INTEGER, allowNull: false },
    dashboardCardId: { type: Sequelize.INTEGER, allowNull: false },
    promoData: { type: Sequelize.JSON },
}, {
    timestamps: true,
    // hooks: {
    //     beforeCreate: async function (cart, options) {
    //         cart.removeCartProducts()
    //     },
    // }
})

Cart.belongsTo(Restaurant)
Cart.belongsTo(DashboardCard)


module.exports = Cart;