const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const AddOnProduct = sequelize_conn.define('addon_products', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.STRING, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 }
}, {
    timestamps: true,
})


module.exports = AddOnProduct;