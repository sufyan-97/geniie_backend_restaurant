'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([

      queryInterface.changeColumn(
        'restaurant_menu_products',
        'foodType',
        {
          type: Sequelize.STRING,
          allowNull: true
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
