'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('cart_products', {

      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      cartId: { type: Sequelize.INTEGER, allowNull: false },

      productId: { type: Sequelize.INTEGER, allowNull: false },

      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },


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
