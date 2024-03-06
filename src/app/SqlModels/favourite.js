const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const Restaurant = require('./Restaurant')

const Favourite = sequelize_conn.define('favourites', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: Sequelize.INTEGER, allowNull: false }
}, {
    timestamps: true,
})


// Favourite.belongsTo(Restaurant)


module.exports = Favourite;