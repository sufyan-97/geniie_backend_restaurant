const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
// const UserNotificationSetting = require('./userNotificationSetting')

const UserSetting = sequelize_conn.define('user_settings', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    slug: { type: Sequelize.TEXT, allowNull: false },
    userId: { type: Sequelize.INTEGER, allowNull: false },
    
}, {
    timestamps: true,
})

// NotificationSetting.hasOne(UserNotificationSetting, { foreignKey: 'notificationId' });

module.exports = UserSetting;