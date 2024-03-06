const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const ProductType = sequelize_conn.define('product_types', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 1 },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
}, {
    timestamps: true,
}
)


module.exports = ProductType;