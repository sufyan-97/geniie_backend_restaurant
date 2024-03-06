'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return Promise.all([

      //add columns
      
      queryInterface.addColumn("restaurants", 'restaurantProfileId', { type: Sequelize.INTEGER, allowNull: true }),
      queryInterface.addColumn("restaurants", 'restaurantMediaId', { type: Sequelize.INTEGER, allowNull: true }),
      queryInterface.addColumn("restaurants", 'isApproved', { type: Sequelize.BOOLEAN, defaultValue: 0 }),

      // drop columns

      queryInterface.removeColumn('restaurants', 'address'),
      queryInterface.removeColumn('restaurants', 'vat'),
      queryInterface.removeColumn('restaurants', 'roleId'),
      queryInterface.removeColumn('restaurants', 'deliveryTime'),
      queryInterface.removeColumn('restaurants', 'deliveryCharges'),
      queryInterface.removeColumn('restaurants', 'deliveryRadius'),
      queryInterface.removeColumn('restaurants', 'currency'),
      queryInterface.removeColumn('restaurants', 'currencySymbol'),
      queryInterface.removeColumn('restaurants', 'priceBracket'),
      queryInterface.removeColumn('restaurants', 'country'),
      queryInterface.removeColumn('restaurants', 'state'),
      queryInterface.removeColumn('restaurants', 'city'),
      queryInterface.removeColumn('restaurants', 'minDeliveryOrderPrice'),

    ])
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
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
