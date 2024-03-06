'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('delivery_rates', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      restaurantId: { type: Sequelize.INTEGER, allowNull: false },
      type: {
        type: Sequelize.ENUM,
        values: ['rateViaOrderPrice', 'rateViaMiles'],
        allowNull: false,
      },
      valueOver: { type: Sequelize.DECIMAL, allowNull: false },
      deliveryCharges: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      createdAt: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: 'TIMESTAMP', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    })
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
