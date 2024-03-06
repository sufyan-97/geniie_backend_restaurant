'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'restaurants',
        'country',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'state',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'city',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'priceBracket',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '$'
        }
      ),
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
