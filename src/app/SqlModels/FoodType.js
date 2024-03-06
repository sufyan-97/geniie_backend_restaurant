const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');


const FoodType = sequelize_conn.define('food_types', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    image: { type: Sequelize.STRING, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true,
})

module.exports = FoodType;