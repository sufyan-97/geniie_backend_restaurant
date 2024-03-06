const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const CartProductAddOn = require('./CartProductAddOn');
const VariationProduct = require('./VariationProduct');

const CartVariationProduct = sequelize_conn.define('cart_add_on_products', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }
}, {
    timestamps: true,
})

CartVariationProduct.belongsTo(CartProductAddOn)
CartVariationProduct.belongsTo(VariationProduct)


module.exports = CartVariationProduct;