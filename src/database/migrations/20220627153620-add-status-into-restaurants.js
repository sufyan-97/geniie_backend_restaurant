'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'restaurants',
        'status',
        {
          type: Sequelize.ENUM,
          values: ['active', 'pending', 'rejected', 'suspended'],
          allowNull: false,
          defaultValue: 'pending'
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
