'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.createTable('restaurant_media', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      license: { type: Sequelize.STRING, allowNull: true },
      menuImage: { type: Sequelize.STRING, allowNull: true },
      alcoholLicense: { type: Sequelize.STRING, allowNull: true },
      logo: { type: Sequelize.STRING, allowNull: true },
      coverImage: { type: Sequelize.STRING, allowNull:true },
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
