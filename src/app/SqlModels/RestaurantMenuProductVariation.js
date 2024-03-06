const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const VariationProduct = require('./VariationProduct');

const RestaurantMenuProductVariation = sequelize_conn.define('restaurant_menu_product_variations', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    isMultipleSelection: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    isRequired: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    min: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    max: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    variationProductId: { type: Sequelize.INTEGER, defaultValue: 0 },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 }
}, {
    timestamps: true,
})

// RestaurantMenuProductVariation.hasMany(RestaurantMenuProductVariation, {
//     onDelete: 'CASCADE',
//     foreignKey: {
//         name: 'parentId',
//         allowNull: true
//     },
//     as: 'children'
// })

RestaurantMenuProductVariation.hasMany(VariationProduct, { foreignKey: 'variationId' })
VariationProduct.hasOne(RestaurantMenuProductVariation, { foreignKey: 'variationProductId' , as: 'child'})


module.exports = RestaurantMenuProductVariation;