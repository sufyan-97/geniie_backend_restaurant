const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const { Restaurant } = require('./Restaurant');

const Review = sequelize_conn.define('reviews', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: Sequelize.INTEGER, allowNull: false },
    restaurantId: { type: Sequelize.INTEGER, allowNull: true },
    foodStars: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 5.00 },
    deliveryStars: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 5.00 },
    comment: { type: Sequelize.STRING },
    relevantId: { type: Sequelize.INTEGER, allowNull: false },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'restaurant'
    },
}, {
    timestamps: true,
})

Review.belongsTo(Restaurant)


module.exports = Review;