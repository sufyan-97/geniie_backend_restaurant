'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('variation_products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      variationId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      name: { type: Sequelize.STRING, allowNull: false },

      price: { type: Sequelize.STRING, allowNull: false },

      currencySymbol:
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Rs'
      },

      currency:
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PKR'
      },

      deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },

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
