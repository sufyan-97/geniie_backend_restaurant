'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bookingId: {
        type: Sequelize.STRING,
        allowNull: false
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      transactionId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      bookingSummary: {
        type: Sequelize.TEXT
      },

      bookingStatusId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      bookingDateTime: {
        type: 'DATETIME',
        allowNull: true
      },

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
