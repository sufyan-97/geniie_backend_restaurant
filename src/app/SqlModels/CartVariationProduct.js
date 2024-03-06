const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const CartProductVariation = require('./CartProductVariation');
const VariationProduct = require('./VariationProduct');

const CartVariationProduct = sequelize_conn.define('cart_variation_products', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }
}, {
    timestamps: true,
})

CartVariationProduct.belongsTo(CartProductVariation)
CartProductVariation.hasMany(CartVariationProduct, { onDelete: 'CASCADE', as: 'variation_products' })
CartVariationProduct.belongsTo(VariationProduct, {})


module.exports = CartVariationProduct;