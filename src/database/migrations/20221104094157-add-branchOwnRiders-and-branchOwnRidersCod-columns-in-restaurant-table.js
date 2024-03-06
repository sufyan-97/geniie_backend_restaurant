'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'restaurants',
        'branchOwnRiders',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: 0,
          allowNull: false
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'branchOwnRidersCod',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: 0,
          allowNull: false
        }
      ),

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
