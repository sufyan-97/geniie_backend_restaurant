// Libraries
const moment = require('moment');
const { Op } = require('sequelize');


// Custom Libraries


// Models
const Booking = require('../app/SqlModels/Booking');
const OrderStatus = require('../app/SqlModels/OrderStatus');


// Constants



module.exports = {
	verifyAlreadyBooked: function (bookingDate, bookingTime, userId) {
		return new Promise(async (resolve, rejects) => {
			try {
				let bookingDateTime = moment(`${bookingDate} ${bookingTime}`).format('YYYY-MM-DD HH:mm:ss')

				console.log('booking time:', bookingDateTime);

				// let currentDateTime = moment().format('YYYY-MM-DD')
				let timeBeforeBooking = moment().add(45, "minutes").format('YYYY-MM-DD HH:mm:ss') //change minute value to super admin defined value
				console.log('timeBeforeBooking', timeBeforeBooking)
				console.log(moment(bookingDateTime).diff(moment(timeBeforeBooking)))

				if (moment(bookingDateTime).diff(moment(timeBeforeBooking)) < 0) {
					return resolve(true)
				}

				let beforeBookingDateTime = moment(bookingDateTime).subtract(15, 'm').format('YYYY-MM-DD HH:mm:ss')
				let afterBookingDateTime = moment(bookingDateTime).add(15, 'm').format('YYYY-MM-DD HH:mm:ss')


				// let bookingDateTimeWithoutMS = moment(bookingDateTime).format('YYYY-MM-DD HH');
				console.log(beforeBookingDateTime, bookingDateTime, afterBookingDateTime)

				let alreadyBooked = await Booking.findOne({
					where: {
						userId: userId,
						bookingDateTime: {
							[Op.between]: [beforeBookingDateTime, afterBookingDateTime]
						}
					},
					include: {
						model: OrderStatus,
						where: {
							slug: { [Op.notIn]: ['completed', 'pending', 'cancelled'] }
						},
						required: true
					}
				})

				if (alreadyBooked) {
					return resolve(true)

				} else {
					return resolve(false)
				}
			} catch (error) {
				rejects(error)
				return
			}
		})
	}
}