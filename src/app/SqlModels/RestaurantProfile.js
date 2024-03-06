const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantProfile = sequelize_conn.define('restaurant_profiles', {

    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    companyName: {
        type: Sequelize.STRING
    },
    capacity: {
        type: Sequelize.INTEGER
    },
    postCode: {
        type: Sequelize.STRING
    },
    menuLink: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fssFsaId: {
        type: Sequelize.STRING
    },
    fssFsaLink: {
        type: Sequelize.STRING
    },
    fssFsaStatus: {
        type: Sequelize.ENUM,
        values: ['pass', 'awaiting_inspection', 'improvement_required', 'my_restaurant_is_exempted']
    },
    fsaId: {
        type: Sequelize.STRING
    },
    fsaLink: {
        type: Sequelize.STRING
    },
    fsaStatus: {
        type: Sequelize.ENUM,
        values: ['pass', 'awaiting_inspection', 'improvement_required', 'my_restaurant_is_exempted']
    },
    vat: { type: Sequelize.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
    deliveryTime: { type: Sequelize.STRING },
    deliveryCharges: { type: Sequelize.STRING },
    deliveryRadius: { type: Sequelize.DECIMAL(15, 2) },
    currency: { type: Sequelize.STRING, allowNull: true },
    currencySymbol: { type: Sequelize.STRING, allowNull: true },
    priceBracket: { type: Sequelize.STRING, allowNull: true, defaultValue: '$' },
    street: { type: Sequelize.STRING, allowNull: true },
    countryId: { type: Sequelize.INTEGER },
    stateId: { type: Sequelize.INTEGER },
    cityId: { type: Sequelize.INTEGER },
    minDeliveryOrderPrice: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    restaurantId: { type: Sequelize.INTEGER },
    deleteAt: { type: Sequelize.DATE, allowNull: true },
}, {
    timestamps: true,
})

module.exports = { RestaurantProfile };