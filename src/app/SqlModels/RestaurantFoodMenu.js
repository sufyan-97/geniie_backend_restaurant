const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const RestaurantMenuProduct = require('./RestaurantMenuProduct');

const RestaurantFoodMenu = sequelize_conn.define('restaurant_food_menus', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false
	},

	isFeature: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
	},
	
	promotionId: {
		type: Sequelize.INTEGER,
		defaultValue: null,
		allowNull: true
	},

	deleteStatus: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0
	},
}, {
    timestamps: true,
})

RestaurantFoodMenu.hasMany(RestaurantMenuProduct, {
	foreignKey: 'restaurantFoodMenuId'
});


module.exports = RestaurantFoodMenu;