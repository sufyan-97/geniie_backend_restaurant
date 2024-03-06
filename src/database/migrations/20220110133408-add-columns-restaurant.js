'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'variation_products',
        'currency'
      ),
      queryInterface.removeColumn(
        'variation_products',
        'currencySymbol'
      ),

      queryInterface.addColumn(
        'restaurants',
        'currency',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'PKR'
        }
      ),

      queryInterface.addColumn(
        'restaurants',
        'currencySymbol',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Rs'
        }
      ),
    ]);
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
