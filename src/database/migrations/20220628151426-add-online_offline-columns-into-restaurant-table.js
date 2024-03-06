'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.addColumn(
				'restaurants',
				'manualStatus',
				{
					type: Sequelize.ENUM,
					values: ['opened', 'closed'],
					allowNull: true,
					defaultValue: null
				},
			),
			queryInterface.addColumn(
				'restaurants',
				'nextOpeningTime',
				{
					type: 'DATETIME',
					allowNull: true
				},
			),
		])
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
