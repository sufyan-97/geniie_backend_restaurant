const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const Onboarding = sequelize_conn.define('onboardings', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    heading: { type: Sequelize.STRING, allowNull: false },
    details: { type: Sequelize.STRING, allowNull: false },
    image: { type: Sequelize.STRING ,allowNull:false},
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true,
})


module.exports = Onboarding;