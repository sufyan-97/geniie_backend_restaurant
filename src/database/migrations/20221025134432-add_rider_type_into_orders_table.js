'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.addColumn(
				'orders',
				'riderType',
				{
					type: Sequelize.ENUM,
					values: ['geniie', 'business'],
					defaultValue: 'geniie'
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
