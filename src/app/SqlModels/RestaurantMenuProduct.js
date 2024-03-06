const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const RestaurantMenuProductVariation = require('./RestaurantMenuProductVariation');
const RestaurantMenuProductAddOn = require('./RestaurantMenuProductAddOn');
const ProductType = require('./ProductType');

const RestaurantMenuProduct = sequelize_conn.define('restaurant_menu_products', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    detail: { type: Sequelize.STRING, allowNull: true },
	image: {
		type: Sequelize.STRING,
		allowNull: true
	},
    price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    foodType: { type: Sequelize.STRING, allowNull: true },
    currency: { type: Sequelize.STRING, allowNull: false },
    currencySymbol: { type: Sequelize.STRING, allowNull: false },
    isAvailable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 1 },
    deleteStatus: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    ageRestrictedItem: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
}, {
    timestamps: true,
})

RestaurantMenuProduct.hasMany(RestaurantMenuProductVariation, { foreignKey: 'restaurantMenuProductId' });
RestaurantMenuProduct.hasMany(RestaurantMenuProductAddOn, { foreignKey: 'restaurantMenuProductId' });

RestaurantMenuProduct.belongsToMany(ProductType, {
    through: 'food_menu_product_types', sourceKey: 'id', targetKey: 'id', foreignKey: 'productId'
})
ProductType.belongsToMany(RestaurantMenuProduct, {
    through: 'food_menu_product_types', sourceKey: 'id', targetKey: 'id', foreignKey: 'productTypeId'
})


module.exports = RestaurantMenuProduct;