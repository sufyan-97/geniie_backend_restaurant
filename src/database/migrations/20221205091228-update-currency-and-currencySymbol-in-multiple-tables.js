'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn(
        'restaurant_menu_products',
        'currency',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'GBP'
        }
      ),
      queryInterface.changeColumn(
        'restaurant_menu_products',
        'currencySymbol',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '£'
        }
      ),
      queryInterface.changeColumn(
        'restaurants',
        'currency',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'GBP'
        }
      ),

      queryInterface.changeColumn(
        'restaurants',
        'currencySymbol',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '£'
        }
      ),
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
