'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {


    return queryInterface.createTable('restaurant_profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      companyName: { type: Sequelize.STRING, allowNull: true },
      capacity: { type: Sequelize.INTEGER, allowNull: true },
      postCode: { type: Sequelize.STRING, allowNull: true },
      menuLink: { type: Sequelize.STRING, allowNull: true },
      fssFsaId: { type: Sequelize.STRING, allowNull: true },
      fssFsaLink: { type: Sequelize.STRING, allowNull: true },
      fssFsaStatus: { type: Sequelize.ENUM, values: ['pass', 'awaiting_inspection', 'improvment_required', 'my_restaurant_is_exempted'] },
      vat: { type: Sequelize.DECIMAL(6, 2), allowNull: true, defaultValue: 0 },
      deliveryTime: { type: Sequelize.STRING, allowNull: true },
      deliveryCharges: { type: Sequelize.STRING, allowNull: true },
      deliveryRadius: { type: Sequelize.DECIMAL(3, 2), allowNull: true },
      currency: { type: Sequelize.STRING, allowNull: true },
      currencySymbol: { type: Sequelize.STRING, allowNull: true },
      priceBracket: { type: Sequelize.STRING, allowNull: true, defaultValue: '$' },
      countryId: { type: Sequelize.INTEGER, allowNull: true },
      stateId: { type: Sequelize.INTEGER, allowNull: true },
      cityId: { type: Sequelize.INTEGER, allowNull: true },
      street: { type: Sequelize.STRING, allowNull: true },
      minDeliveryOrderPrice: { type: Sequelize.INTEGER, allowNull: true },
      deleteAt: { type: Sequelize.DATE, allowNull: true },

      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    })
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
