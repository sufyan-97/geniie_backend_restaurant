const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const { Restaurant } = require('./Restaurant')

const TopDeal = sequelize_conn.define('top_deals', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    image: { type: Sequelize.STRING, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true,
})

TopDeal.belongsTo(Restaurant)


module.exports = TopDeal;