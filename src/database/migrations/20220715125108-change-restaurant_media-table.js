'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.dropTable('restaurant_media'),
			queryInterface.createTable('restaurant_medias', {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				restaurantId: {
					type: Sequelize.INTEGER,
					allowNull: false
				},
				mediaType: {
					type: Sequelize.ENUM,
					values: [
						'license', 'menu', 'alcoholLicense', 'logo', 'photoId', 'proofOfOwnership', 'banner'
					],
					allowNull: true,
					defaultValue: null
				},
				media: {
					type: Sequelize.STRING,
					allowNull: false,
				},
				mediaFileType: {
					type: Sequelize.STRING,
				},

				mediaFileSizeByte: {
					type: Sequelize.INTEGER
				},

				createdAt: {
					type: 'TIMESTAMP',
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
				},

				updatedAt: {
					type: 'TIMESTAMP',
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
				}
			})
		])
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
