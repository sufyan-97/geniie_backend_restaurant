'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'restaurant_menu_product_variations',
        'currency'
      ),
      queryInterface.removeColumn(
        'restaurant_menu_product_variations',
        'currencySymbol'
      ),
      queryInterface.removeColumn(
        'restaurant_menu_product_variations',
        'price'
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_variations',
        'type',
        {
          type: Sequelize.ENUM,
          values: ['single', 'multiple'],
          allowNull: false,
          defaultValue: 'single'
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_variations',
        'isRequired',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
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
