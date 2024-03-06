'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([

			queryInterface.changeColumn(
				'restaurant_menu_products',
				'image',
				{
					type: Sequelize.TEXT,
					allowNull: true
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
