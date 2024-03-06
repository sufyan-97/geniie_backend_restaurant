'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([

      queryInterface.changeColumn(
        'restaurants',
        'vat',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'vatNumber',
        {
          type: Sequelize.STRING,
          defaultValue: ''
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
