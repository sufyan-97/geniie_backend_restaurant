const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const CartProduct = require('./CartProduct');
const RestaurantMenuProductAddOn = require('./RestaurantMenuProductAddOn');

const CartProductAddOns = sequelize_conn.define('cart_product_add_ons', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }
}, {
    timestamps: true,
})

CartProductAddOns.belongsTo(CartProduct)
CartProduct.hasMany(CartProductAddOns, { onDelete: 'CASCADE' })
CartProductAddOns.belongsTo(RestaurantMenuProductAddOn, { foreignKey: 'variationId' })


module.exports = CartProductAddOns;