'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('reviews', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
      userId: { type: Sequelize.INTEGER, allowNull: false },
      
      restaurantId: { type: Sequelize.INTEGER, allowNull: false },

      foodStars: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 5.00 },

      deliveryStars: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 5.00 },

      comment: { type: Sequelize.STRING },

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

	down: async (queryInterface, Sequelize) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	}
};
