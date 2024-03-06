'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([

      queryInterface.changeColumn(
        'restaurant_profiles',
        'fsaId',
        {
          type: Sequelize.STRING,
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'specialInstructions',
        {
          type: Sequelize.STRING,
        }
      ),

    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
