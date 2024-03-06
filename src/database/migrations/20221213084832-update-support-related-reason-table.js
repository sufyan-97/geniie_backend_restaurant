'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('support_related_reasons', 'roleId', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.addColumn('support_related_reasons', 'orderStatusId', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.addColumn('support_related_reasons', 'departmentId', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
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
