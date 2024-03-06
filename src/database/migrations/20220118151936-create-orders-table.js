'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('orders', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			orderId: {
				type: Sequelize.STRING,
				allowNull: false
			},

			userId: {
				type: Sequelize.INTEGER,
				allowNull: false
			},

			restaurantId: {
				type: Sequelize.INTEGER,
				allowNull: false
			},

			transactionId: {
				type: Sequelize.INTEGER,
				allowNull: true
			},

			orderSummary: {
				type: Sequelize.TEXT
			},

			orderStatus: {
				type: Sequelize.INTEGER,
				allowNull: false
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

	down: async (queryInterface, Sequelize) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	}
};
