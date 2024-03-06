const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const Cart = require('./Cart');
const RestaurantMenuProduct = require('./RestaurantMenuProduct');

const CartProduct = sequelize_conn.define('cart_products', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    instructions: { type: Sequelize.STRING },
    foodMenuId: { type: Sequelize.INTEGER, allowNull: false },
    productNotAvailableValueId: { type: Sequelize.INTEGER, allowNull: false },
}, {
    timestamps: true,
})

CartProduct.belongsTo(Cart)
Cart.hasMany(CartProduct, { onDelete: 'cascade' })
CartProduct.belongsTo(RestaurantMenuProduct, { foreignKey: 'productId', as: 'productData' })


module.exports = CartProduct;