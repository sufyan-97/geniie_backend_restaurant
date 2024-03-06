'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.bulkInsert('dashboard_cards', [
      {
        name: "dine_in",
        description: "food dine in service"
      },
      {
        name: "pickup",
        description: "food pickup service"
      },
      {
        name: "delivery",
        description: "food delivery service"
      },
    ])

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};