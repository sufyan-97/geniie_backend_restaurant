module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'restaurant_profiles',
        'fsaId',
        {
          type: Sequelize.INTEGER,
        }
      ),
      queryInterface.addColumn(
        'restaurant_profiles',
        'fsaLink',
        {
          type: Sequelize.STRING,
        }
      ),
      queryInterface.addColumn(
        'restaurant_profiles',
        'fsaStatus',
        {
          type: Sequelize.ENUM,
          values: ['pass', 'awaiting_inspection', 'improvement_required', 'my_restaurant_is_exempted']
        }
      ),
      queryInterface.changeColumn(
        'restaurant_profiles',
        'fssFsaStatus',
        {
          type: Sequelize.ENUM,
          values: ['pass', 'awaiting_inspection', 'improvement_required', 'my_restaurant_is_exempted']
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