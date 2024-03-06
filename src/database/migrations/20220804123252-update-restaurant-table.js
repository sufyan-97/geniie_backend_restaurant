'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('restaurants', "suspensionDate", {
      type: Sequelize.DATE,
      defaultValue: null
    });
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
