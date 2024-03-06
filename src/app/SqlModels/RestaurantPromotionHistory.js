const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantPromotionHistory = sequelize_conn.define('restaurant_promotion_history', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},

	promotionId: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},

	restaurantId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},

	status: {
		type: Sequelize.ENUM,
		values: ['availed', 'un_availed', 'product_added', 'product_removed']
	}
}, {
	timestamps: true,
	freezeTableName : true
})

module.exports = RestaurantPromotionHistory;