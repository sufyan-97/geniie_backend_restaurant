const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const AddOnProduct = require('./AddOnProduct');

const RestaurantMenuProductAddOn = sequelize_conn.define('restaurant_menu_product_add_ons', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    isMultipleSelection: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    isRequired: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 }
}, {
    timestamps: true,
})

RestaurantMenuProductAddOn.hasMany(AddOnProduct, { foreignKey: 'variationId' })

module.exports = RestaurantMenuProductAddOn;