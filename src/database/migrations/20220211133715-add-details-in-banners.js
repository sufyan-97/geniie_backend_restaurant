'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'banners',
        'heading',
        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      ),
      queryInterface.addColumn(
        'banners',
        'subHeading',
        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      ),
      queryInterface.addColumn(
        'banners',
        'detail',
        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      ),
      queryInterface.addColumn(
        'banners',
        'termAndCondition',
        { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      ),
      queryInterface.removeColumn(
        'banners',
        'restaurantId'
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
