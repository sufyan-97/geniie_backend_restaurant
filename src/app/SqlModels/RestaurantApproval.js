const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const RestaurantApproval = sequelize_conn.define('restaurant_approvals', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    dataId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    model: {
        type: Sequelize.STRING,
        allowNull: false
    },
    action: {
        type: Sequelize.STRING,
        allowNull: false
    },

    fields: {
        type: Sequelize.JSON,
        allowNull: false
    },

    acceptedFields: {
        type: Sequelize.JSON
    },

    rejectedFields: {
        type: Sequelize.JSON
    },

    status: {
        type: Sequelize.ENUM,
        values: ['pending', 'accepted', 'rejected', 'partially_rejected'],
        defaultValue: 'pending'
    },

}, {
    timestamps: true,
})

module.exports = RestaurantApproval;