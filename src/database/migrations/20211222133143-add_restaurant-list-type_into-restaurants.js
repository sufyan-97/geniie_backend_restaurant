'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        'restaurants',
        'isFeatured'
      ),
      queryInterface.removeColumn(
        'restaurants',
        'isTopPartner'
      ),
      queryInterface.addColumn(
        'restaurants',
        'listTypeId',
        {
          type: Sequelize.INTEGER,
        }
      )
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
