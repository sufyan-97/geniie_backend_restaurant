// Libraries
const Sequelize = require('sequelize');

// Custom Libraries
const translation = require('../../lib/translation')

// Configs
const { sequelize_conn } = require('../../../config/database');

const SettingMenuItem = sequelize_conn.define('setting_menu_items', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    arrowImage: {
        type: Sequelize.STRING,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isWebView: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    login_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    deleteStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    sortOrder: {
        type: Sequelize.DECIMAL(10, 6),
        defaultValue: 0
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1
    },
}, {
    timestamps: true,
    hooks: {
        afterFind: (instance, options) => {
            if (instance && instance.length > 0) {
                instance.map((instanceItem) => {
                    instanceItem.name = translation(instanceItem.name, instanceItem.name, options.lngCode ? options.lngCode : 'en')
                })
            } else if (instance && Object.keys(instance).length > 0) {
                instance.name = translation(instance.name, instance.name, options.lngCode ? options.lngCode : 'en')
            }
            return instance
        }
    }
})


module.exports = SettingMenuItem;