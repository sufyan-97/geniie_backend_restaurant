'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.createTable('restaurant_approvals', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			
			userId: {
				type: Sequelize.INTEGER,
				allowNull: false
			},

			action: {
				type: Sequelize.STRING,
				allowNull: false
			},

			fields: {
				type: Sequelize.TEXT,
				allowNull: false
			},

			acceptedFields: {
				type: Sequelize.TEXT
			},

			rejectedFields: {
				type: Sequelize.TEXT
			},

			status: {
				type: Sequelize.ENUM,
				values: ['pending', 'accepted', 'rejected', 'partially_rejected'],
				defaultValue: 'pending'
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
