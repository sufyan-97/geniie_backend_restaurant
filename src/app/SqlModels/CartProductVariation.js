const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const CartProduct = require('./CartProduct');
const RestaurantMenuProductVariation = require('./RestaurantMenuProductVariation');
const RestaurantMenuProduct = require('./RestaurantMenuProduct');

const CartProductVariation = sequelize_conn.define('cart_product_variations', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
}, {
    timestamps: true,
})

CartProductVariation.belongsTo(CartProduct)
CartProduct.hasMany(CartProductVariation, { onDelete: 'CASCADE',as: 'variations' })
CartProductVariation.belongsTo(RestaurantMenuProductVariation, { foreignKey: 'variationId', as: 'variationData' })


module.exports = CartProductVariation;