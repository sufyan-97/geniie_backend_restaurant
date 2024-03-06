const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');


const ProductNotAvailable = sequelize_conn.define('product_not_available_values', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, allowNull: false },
    isSelected: { type: Sequelize.BOOLEAN, defaultValue: 0, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    sortOrder: { type: Sequelize.DECIMAL(10, 6), defaultValue: 0 },
}, {
    timestamps: true,
})

module.exports = ProductNotAvailable;