const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const UserNotificationSetting = require('./userNotificationSetting')

const NotificationSetting = sequelize_conn.define('notification_settings', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    login_required: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 1 },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    isActive: { type: Sequelize.BOOLEAN, defaultValue: 1 },
    sortOrder: { type: Sequelize.DECIMAL(10, 6), defaultValue: 0 },
}, {
    timestamps: true,
})

NotificationSetting.hasOne(UserNotificationSetting, { foreignKey: 'notificationId' });

module.exports = NotificationSetting;