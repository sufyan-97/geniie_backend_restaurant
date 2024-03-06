const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantMedia = sequelize_conn.define('restaurant_medias', {

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
	expiryDate: {
		type: Sequelize.DATE,
		defaultValue: null
	},
}, {
    timestamps: true,
    freezeTableName:true
})

module.exports = RestaurantMedia;