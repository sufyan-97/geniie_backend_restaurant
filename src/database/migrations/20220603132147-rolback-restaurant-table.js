'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {





    return Promise.all([  
      queryInterface.addColumn(
        'restaurants',
        'vat',
        {
          type: Sequelize.INTEGER,
          defaultValue:60,
          allowNull: true
        }
      ),
      
      queryInterface.addColumn(
        'restaurants',
        'address',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'roleId',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'deliveryTime',
        {
          type: Sequelize.STRING,
          defaultValue:"40 Min",
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'deliveryCharges',
        {
          type: Sequelize.DECIMAL(5,2),
          defaultValue:"20",
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'deliveryRadius',
        {
          type: Sequelize.DECIMAL(3,2),
          defaultValue:'5.00',
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'currency',
        {
          type: Sequelize.STRING,
          defaultValue:"PKR",
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'currencySymbol',
        {
          type: Sequelize.STRING,
          defaultValue:"Rs",
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'priceBracket',
        {
          type: Sequelize.STRING, 
          defaultValue: '$',
          allowNull: true
        }
      ),

      queryInterface.addColumn(
        'restaurants',
        'country',
        {
          type: Sequelize.STRING, 
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'state',
        {
          type: Sequelize.STRING, 
          defaultValue: '$',
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'city',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.addColumn(
        'restaurants',
        'minDeliveryOrderPrice',
        {
          type: Sequelize.DECIMAL(5,2),
          defaultValue:1,
          allowNull: true
        }
      ),
  ])




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
