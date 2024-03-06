'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([

			queryInterface.changeColumn(
				'order_history',
				'action',
				{
					type: Sequelize.STRING
				}
			),

		]);
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
