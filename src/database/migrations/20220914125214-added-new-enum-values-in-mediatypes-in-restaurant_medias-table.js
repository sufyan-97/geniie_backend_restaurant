'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([

      queryInterface.changeColumn(
        'restaurant_medias',
        'mediaType',
        {
          type: Sequelize.ENUM,
          values: [
						'license', 'menu', 'alcoholLicense', 'logo', 'photoId', 'proofOfOwnership', 'banner', 'photoOfShopFront'
					],
          allowNull: true,
					defaultValue: null
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