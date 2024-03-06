const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const VariationProduct = sequelize_conn.define('variation_products', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    variationId: { type: Sequelize.INTEGER, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 }
}, {
    timestamps: true,
})


module.exports = VariationProduct;