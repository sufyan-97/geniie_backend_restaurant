'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'restaurant_menu_product_add_ons',
        'currency'
      ),
      queryInterface.removeColumn(
        'restaurant_menu_product_add_ons',
        'currencySymbol'
      ),
      queryInterface.removeColumn(
        'restaurant_menu_product_add_ons',
        'price'
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_add_ons',
        'isMultipleSelection',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_add_ons',
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
