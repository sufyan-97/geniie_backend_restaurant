const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

// Custom Libraries
const translation = require('../../lib/translation')

const ContactLessSuggestion = sequelize_conn.define('contact_less_suggestions', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    detail: { type: Sequelize.STRING, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
}, {
    timestamps: true,
    hooks: {
        afterFind: (instance, options) => {
            if (instance && instance.length > 0) {
                instance.map((instanceItem) => {
                    instanceItem.name = translation(instanceItem.name, instanceItem.name, options.lngCode? options.lngCode: 'en')
                    instanceItem.detail = translation(instanceItem.detail, instanceItem.detail, options.lngCode? options.lngCode: 'en')
                })
            } else if (instance && Object.keys(instance).length > 0) {
                instance.name = translation(instance.name, instance.name, options.lngCode ? options.lngCode : 'en')
                instance.detail = translation(instance.detail, instance.detail, options.lngCode ? options.lngCode : 'en')
            }
            return instance
        }
    }
})

module.exports = ContactLessSuggestion;