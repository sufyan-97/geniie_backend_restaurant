'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    
    queryInterface.addColumn('restaurant_profiles', 'restaurantId', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    
    queryInterface.addColumn('restaurant_media', 'restaurantId', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
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
