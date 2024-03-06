'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'restaurants',
        'image',
        {
          type: Sequelize.STRING,
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'coverImage',
        {
          type: Sequelize.STRING,
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'deliveryTime',
        {
          type: Sequelize.STRING,
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'deliveryCharges',
        {
          type: Sequelize.DECIMAL(2),
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'isFeatured',
        {
          type: Sequelize.BOOLEAN,
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'isTopPartner',
        {
          type: Sequelize.BOOLEAN,
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
