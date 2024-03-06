const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
// const { Restaurant } = require('./Restaurant')

const Banner = sequelize_conn.define('banners', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    image: { type: Sequelize.STRING, allowNull: false },
    heading: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
    subHeading: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
    detail: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
    termAndCondition: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    isActive: { type: Sequelize.BOOLEAN, defaultValue: 1 },
}, {
    timestamps: true,
})

// Banner.belongsTo(Restaurant)


module.exports = Banner;