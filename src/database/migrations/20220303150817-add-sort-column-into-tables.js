'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'main_menu_items',
        'sortOrder',
        {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false
        }
      ),
      queryInterface.addColumn(
        'notification_settings',
        'sortOrder',
        {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false
        }
      ),
      queryInterface.addColumn(
        'order_statuses',
        'sortOrder',
        {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false
        }
      ),
      queryInterface.addColumn(
        'product_not_available_values',
        'sortOrder',
        {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false
        }
      ),
      queryInterface.addColumn(
        'setting_menu_items',
        'sortOrder',
        {
          type: Sequelize.DECIMAL(10, 6),
          allowNull: false
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
