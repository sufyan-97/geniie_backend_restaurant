'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'restaurant_menu_products',
        'currency',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'PKR'
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_products',
        'currencySymbol',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Rs'
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_add_ons',
        'currency',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'PKR'
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_add_ons',
        'currencySymbol',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Rs'
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_variations',
        'currency',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'PKR'
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_variations',
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
