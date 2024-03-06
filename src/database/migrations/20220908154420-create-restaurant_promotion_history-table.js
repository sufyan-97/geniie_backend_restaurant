'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.createTable('restaurant_promotion_history', {
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
			},

			createdAt: {
				type: 'TIMESTAMP',
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},

			updatedAt: {
				type: 'TIMESTAMP',
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			}
		})
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	}
};
