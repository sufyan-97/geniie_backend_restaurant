'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'restaurant_menu_product_add_ons',
        'productVariationId',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_variations',
        'min',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        }
      ),
      queryInterface.addColumn(
        'restaurant_menu_product_variations',
        'max',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
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
