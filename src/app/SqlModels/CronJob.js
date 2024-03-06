const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
// const { Restaurant } = require('./Restaurant')

const CronJob = sequelize_conn.define('cron_jobs', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    command: {
        type: Sequelize.STRING,
        allowNull: false
    },
    once: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }, 
    status: {
        type: Sequelize.ENUM,
        values: ['pending', 'running', 'completed'],
        defaultValue: 'pending',
        allowNull: false
    },

    statusUpdateTime: {
        type: Sequelize.STRING,
        allowNull: true
    },

    interval: {
        type: Sequelize.STRING,
        allowNull: false
    },

    nextScheduled: {
        type: Sequelize.DATE,
        defaultValue: null
    },

    lastExecuted: {
        type: Sequelize.DATE,
        defaultValue: null
    },

    deleteStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
})

// Banner.belongsTo(Restaurant)


module.exports = CronJob;