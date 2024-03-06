'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.renameColumn(
      'product_not_available_values',
      'isDefault',
      'isSelected'
    )
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
