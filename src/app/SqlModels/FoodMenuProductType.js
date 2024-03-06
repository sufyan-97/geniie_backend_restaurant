const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const FoodMenuProductType = sequelize_conn.define('food_menu_product_types', {
    id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},

	productId: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},

	productTypeId: {
		type: Sequelize.INTEGER,
		allowNull: false
	}
}, {
    timestamps: true,
}
)


module.exports = FoodMenuProductType;