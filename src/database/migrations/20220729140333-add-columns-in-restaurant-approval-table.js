'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.addColumn(
				'restaurant_approvals',
				'dataId',
				{
					type: Sequelize.INTEGER,
					allowNull: false,
				}
			),
			queryInterface.addColumn(
				'restaurant_approvals',
				'model',
				{
					type: Sequelize.STRING,
					allowNull: false,
				}
			)
		])
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
