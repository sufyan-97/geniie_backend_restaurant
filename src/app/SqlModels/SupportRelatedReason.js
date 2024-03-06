const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

//Model
const OrderStatus = require("./OrderStatus");

const SupportRelatedReason = sequelize_conn.define('support_related_reasons', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    type: { type: Sequelize.STRING, allowNull: false },
    supportTicketRequired: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    roleId: { type: Sequelize.INTEGER, allowNull: false },
    orderStatusId: { type: Sequelize.INTEGER, allowNull: true },
    departmentId: { type: Sequelize.INTEGER, allowNull: true },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
}, {
    timestamps: true,
})

SupportRelatedReason.belongsTo(OrderStatus)

// SupportRelatedReason.belongsToMany(OrderStatus, {
//     through: 'support_related_reason_order_statuses', sourceKey: 'id', targetKey: 'id', foreignKey: 'supportRelatedReasonId'
// });


module.exports = SupportRelatedReason;