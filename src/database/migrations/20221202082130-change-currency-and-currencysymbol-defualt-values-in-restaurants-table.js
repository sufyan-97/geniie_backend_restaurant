'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
		return Promise.all([
      queryInterface.changeColumn('restaurants', 'currency', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'GBP'
      }),
      queryInterface.changeColumn('restaurants', 'currencySymbol', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '£'
      })
    ]) 
	},

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
