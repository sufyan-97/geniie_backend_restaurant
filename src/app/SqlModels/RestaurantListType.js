const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');


const RestaurantListType = sequelize_conn.define('restaurant_list_types', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
}, {
    timestamps: true,
})

module.exports = RestaurantListType;