'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([

      queryInterface.changeColumn(
        'restaurants',
        'vat',
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
