'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('restaurant_time_laps', {

      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      restaurantTimingId: { type: Sequelize.STRING, allowNull: false },
      from: { type: Sequelize.STRING, allowNull: false },
      to: { type: Sequelize.STRING, allowNull: false },
      deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    })
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
