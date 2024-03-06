'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'order_history',
        'actionData',
        {
          type: Sequelize.TEXT
        }
      ),
      queryInterface.changeColumn(
        'order_history',
        'action',
        {
          type: Sequelize.ENUM,
          values: ['created', 'accepted_by_restaurant', 'fulfilled_by_restaurant', 'declined_by_restaurant', 'picked_by_rider', 'delivered_by_rider', 'picked_by_user'],
          allowNull: false
        }
      )
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
