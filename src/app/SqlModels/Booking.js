const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const randomize = require("randomatic")

const { Restaurant } = require('./Restaurant');
// const OrderHistory = require('./OrderHistory')
const OrderStatus = require('./OrderStatus');
const OrderHistory = require('./OrderHistory');
const Review = require('./Review');
// const DashboardCard = require('./dashboardCard');
// const DashboardCard = require('./dashboardCard');

const Booking = sequelize_conn.define('bookings', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bookingId: {
        type: Sequelize.STRING,
        allowNull: false
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    transactionId: {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    bookingSummary: {
        type: Sequelize.JSON
    },

    bookingStatusId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    bookingDateTime: {
        type: 'DATETIME',
        allowNull: true
    },
}, {
    timestamps: true,
    hooks: {
        afterFind: async function (booking, options) {
            if (booking && booking.length > 0) {
                booking.map(item => {
                    try {
                        item.bookingSummary = JSON.parse(item.bookingSummary)
                    } catch (error) {
                        console.log(error);
                    }
                })
            } else if (booking && Object.keys(booking).length > 0) {
                try {
                    booking.bookingSummary = JSON.parse(booking.bookingSummary)
                } catch (error) {
                    console.log(error);
                }
            }
        },
        beforeCreate: async function (booking, options) {
            let bookingId = await generateBookingId()
            booking.bookingId = bookingId
        },
    }

})

Booking.belongsTo(Restaurant)
// Order.belongsTo(DashboardCard)
Booking.hasOne(OrderHistory, { foreignKey: 'orderId' })

Booking.belongsTo(OrderStatus, { foreignKey: 'bookingStatusId' })

Booking.hasOne(Review, { foreignKey: 'relevantId' })

async function checkUniqueBookingId(bookingId) {
    let result = await Booking.findOne({ where: { bookingId: bookingId } });
    if (result) {
        return false
    } else {
        return true
    }
}


async function generateBookingId() {
    let bookingId = `#${randomize("0", 1, { exclude: "0" })}${randomize('0', 7)}`;
    if (await checkUniqueBookingId(bookingId)) {
        return bookingId
    } else {
        return await generateBookingId()
    }
}

module.exports = Booking;