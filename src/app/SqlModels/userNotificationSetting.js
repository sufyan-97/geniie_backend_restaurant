const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');


const UserNotificationSetting = sequelize_conn.define('user_notification_settings', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: Sequelize.INTEGER, allowNull: false },
    value: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true,
})

// UserNotificationSetting.belongsTo(NotificationSetting, { foreignKey: 'id' })

module.exports = UserNotificationSetting;