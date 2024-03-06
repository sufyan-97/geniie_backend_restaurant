const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantType = require('./RestaurantTypes');
const { RestaurantProfile } = require('./RestaurantProfile');
const RestaurantMedia = require('./RestaurantMedia')
const RestaurantFoodMenu = require('./RestaurantFoodMenu');
const RestaurantTiming = require('./RestaurantTiming');
const RestaurantPaymentMethods = require('./RestaurantPaymentMethod');
const DashboardCard = require('./dashboardCard');
const { model } = require('mongoose');
const DeliveryRates = require('./DeliveryRates');
// const Favourite = require('./favourite');

const Restaurant = sequelize_conn.define('restaurants', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: Sequelize.STRING, allowNull: false },
    longitude: { type: Sequelize.DECIMAL(10, 6) },
    latitude: { type: Sequelize.DECIMAL(10, 6) },
    userId: { type: Sequelize.INTEGER, allowNull: false },
    providerId: { type: Sequelize.INTEGER, allowNull: false },
    isOpen: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    listTypeId: { type: Sequelize.INTEGER },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    restaurantProfileId: { type: Sequelize.INTEGER, allowNull: true },
    restaurantMediaId: { type: Sequelize.INTEGER, allowNull: true },
    isApproved: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    address: { type: Sequelize.STRING, allowNull: false },
    roleId: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },

    // sittingCapacity: { type: Sequelize.INTEGER },
    // menuLink: { type: Sequelize.STRING },
    // fsaStatus: { type: Sequelize.STRING },
    // fsaLink: { type: Sequelize.STRING },
    // fsaId: { type: Sequelize.INTEGER },
    // capacity: { type: Sequelize.VIRTUAL },
    // postCode: { type: Sequelize.VIRTUAL },
    // menuLink: { type: Sequelize.VIRTUAL },
    // fssFsaId: { type: Sequelize.VIRTUAL },
    // fssFsaLink: { type: Sequelize.VIRTUAL },
    // fssFsaStatus: { type: Sequelize.VIRTUAL },
    vat: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    vatNumber: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    isVat: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    deliveryTime: { type: Sequelize.STRING },
    deliveryCharges: { type: Sequelize.STRING },
    deliveryRadius: { type: Sequelize.DECIMAL(15, 2) },
    currency: { type: Sequelize.STRING, allowNull: true },
    currencySymbol: { type: Sequelize.STRING, allowNull: true },
    priceBracket: { type: Sequelize.STRING, allowNull: true, defaultValue: '$' },
    country: { type: Sequelize.INTEGER },
    state: { type: Sequelize.INTEGER },
    city: { type: Sequelize.INTEGER },
    minDeliveryOrderPrice: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    deliveryRatePerMile: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    branchOwnRiders: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    branchOwnRidersCod: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    specialInstructions: { type: Sequelize.STRING },
    restaurantWebsiteLink: { type: Sequelize.STRING, allowNull: true },

    //media
    // license: { type: Sequelize.VIRTUAL },
    // menu: { type: Sequelize.STRING },
    // alcoholLicense: { type: Sequelize.STRING },
    image: { type: Sequelize.STRING, allowNull: true },
    coverImage: { type: Sequelize.STRING, allowNull: true },

    status: {
        type: Sequelize.ENUM,
        values: ['active', 'pending', 'rejected', 'suspended'],
        allowNull: false,
        defaultValue: 'pending'
    },
    manualStatus: {
        type: Sequelize.ENUM,
        values: ['opened', 'closed'],
        allowNull: true,
    },
    nextOpeningTime: {
        type: 'DATETIME',
        allowNull: true
    },
    suspensionDate: {
        type: 'DATETIME',//Sequelize.DATE,
        allowNull: true
    },
    deliveryOption: {
        type: Sequelize.ENUM,
        values: ['rateViaOrderPrice', 'rateViaMiles'],
        allowNull: false,
      },

}, {
    timestamps: true,
    hooks: {
        beforeFind: async function (item) {

            // console.log(item);

            let newModals = [
                {
                    model: RestaurantProfile,
                    attributes: { exclude: ['id'] }
                },
                {
                    model: RestaurantMedia,
                    attributes: { exclude: ['id'] }
                }]
            if (item.include) {
                if (item.include.length > 0) {
                    item.include = [...item.include, ...newModals]
                }
                else if (Object.keys(item.include).length) {
                    item.include = [item.include, ...newModals]
                }
            } else {
                item.include = newModals
            }
        },
        // afterFind: async function (record) {
        //     console.log(record);

        //     let testRecord = null;

        //     if (record && record.length > 0) {
        //         testRecord = [...record];

        //         testRecord.forEach(el => {
        //             if (el.restaurant_profile && Object.keys(el.restaurant_profile).length != 0) {
        //                 // console.log("its profile===", el.restaurant_profile.companyName)
        //                 el.companyName = el.restaurant_profile.companyName
        //                 el.capacity = el.restaurant_profile.capacity
        //                 el.postCode = el.restaurant_profile.postCode
        //                 el.menuLink = el.restaurant_profile.menuLink
        //                 el.fssFsaId = el.restaurant_profile.fssFsaId
        //                 el.fssFsaLink = el.restaurant_profile.fssFsaLink
        //                 el.fssFsaStatus = el.restaurant_profile.fssFsaStatus
        //                 el.deliveryTime = el.restaurant_profile.deliveryTime
        //                 el.deliveryCharges = el.restaurant_profile.deliveryCharges
        //                 el.deliveryRadius = el.restaurant_profile.deliveryRadius
        //                 el.currency = el.restaurant_profile.currency
        //                 el.currencySymbol = el.restaurant_profile.currencySymbol
        //                 el.priceBracket = el.restaurant_profile.priceBracket
        //                 el.street = el.restaurant_profile.street
        //                 el.countryId = el.restaurant_profile.countryId
        //                 el.restaurantId = el.restaurant_profile.restaurantId
        //                 el.stateId = el.restaurant_profile.stateId
        //                 el.cityId = el.restaurant_profile.cityId
        //                 el.minDeliveryOrderPrice = el.restaurant_profile.minDeliveryOrderPrice
        //             }

        //             if (el.restaurant_medium && Object.keys(el.restaurant_medium).length != 0) {
        //                 el.license = el.restaurant_medium.license
        //                 el.menuImage = el.restaurant_medium.menuImage
        //                 el.alcoholLicense = el.restaurant_medium.alcoholLicense
        //                 el.image = el.restaurant_medium.image
        //                 el.coverImage = el.restaurant_medium.coverImage
        //             }
        //         })
        //     } else if (record && Object.keys(record).length > 0) {
        //         testRecord = { ...record }
        //         let el = testRecord
        //         if (el.restaurant_profile && Object.keys(el.restaurant_profile).length != 0) {
        //             // console.log("its profile===", el.restaurant_profile.companyName)
        //             el.companyName = el.restaurant_profile.companyName
        //             el.capacity = el.restaurant_profile.capacity
        //             el.postCode = el.restaurant_profile.postCode
        //             el.menuLink = el.restaurant_profile.menuLink
        //             el.fssFsaId = el.restaurant_profile.fssFsaId
        //             el.fssFsaLink = el.restaurant_profile.fssFsaLink
        //             el.fssFsaStatus = el.restaurant_profile.fssFsaStatus
        //             el.deliveryTime = el.restaurant_profile.deliveryTime
        //             el.deliveryCharges = el.restaurant_profile.deliveryCharges
        //             el.deliveryRadius = el.restaurant_profile.deliveryRadius
        //             el.currency = el.restaurant_profile.currency
        //             el.currencySymbol = el.restaurant_profile.currencySymbol
        //             el.priceBracket = el.restaurant_profile.priceBracket
        //             el.street = el.restaurant_profile.street
        //             el.countryId = el.restaurant_profile.countryId
        //             el.restaurantId = el.restaurant_profile.restaurantId
        //             el.stateId = el.restaurant_profile.stateId
        //             el.cityId = el.restaurant_profile.cityId
        //             el.minDeliveryOrderPrice = el.restaurant_profile.minDeliveryOrderPrice
        //         }

        //         if (el.restaurant_medium && Object.keys(el.restaurant_medium).length != 0) {
        //             el.license = el.restaurant_medium.license
        //             el.menuImage = el.restaurant_medium.menuImage
        //             el.alcoholLicense = el.restaurant_medium.alcoholLicense
        //             el.image = el.restaurant_medium.image
        //             el.coverImage = el.restaurant_medium.coverImage
        //         }
        //     }
        //     return testRecord
        // }
    }
})

const Favourite = sequelize_conn.define('favourites', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: Sequelize.INTEGER, allowNull: false }
}, {
    timestamps: true,
})

Restaurant.hasMany(RestaurantType, { foreignKey: 'restaurantId' });
// RestaurantType.belongsTo(Restaurant)
Restaurant.hasMany(RestaurantFoodMenu, { foreignKey: 'restaurantId' });
Restaurant.hasMany(RestaurantTiming, { foreignKey: 'restaurantId' });
Restaurant.hasMany(RestaurantPaymentMethods, { foreignKey: 'restaurantId' });
Restaurant.hasMany(Favourite, { foreignKey: 'restaurantId' });
Restaurant.hasMany(RestaurantMedia, { foreignKey: 'restaurantId' });
RestaurantMedia.belongsTo(Restaurant);
// RestaurantProfile
Restaurant.hasOne(RestaurantProfile, { foreignKey: 'restaurantId' });
RestaurantProfile.belongsTo(Restaurant);

Favourite.belongsTo(Restaurant)
DashboardCard.hasMany(Favourite, { foreignKey: 'dashboardCardId' })

// DashboardCard.belongsToMany(Restaurant, { through: 'restaurant_dashboard_cards', as:"restaurantCard" })
Restaurant.belongsToMany(DashboardCard, { through: 'restaurant_dashboard_cards', as: 'dashboardCard' })
Restaurant.hasMany(DeliveryRates)
module.exports = { Restaurant, Favourite };