const { Op } = require('sequelize')
const moment = require('moment');

// Modals
var Order = require('../../SqlModels/Order');
var OrderStatus = require('../../SqlModels/OrderStatus');
var orderHistory = require('../../SqlModels/OrderHistory')
// var Cart = require('../../SqlModels/Cart');
const { Restaurant } = require('../../SqlModels/Restaurant');
const Booking = require('../../SqlModels/Booking');


exports.getAll = async function (req, res) {

	if (req.user.roleName !== "restaurant") {
		return res.status(400).send({ message: "Error: Unauthorized Access." })
	}


	let userId = req.user.id
	let frequency = req.query.frequency


	let startDate = req.query.startDate ? req.query.startDate : ''
	let endDate = req.query.endDate ? req.query.endDate : ''

	if (frequency == '7_days') {

		startDate = moment().subtract(7, 'days').startOf('day').format()
		endDate = moment().format()

	} else if (frequency == 'last_month') {

		startDate = moment().subtract(1, 'month').startOf('month').startOf('day').format()
		endDate = moment().subtract(1, 'month').endOf('month').endOf('day').format()

	} else if (frequency == 'this_month') {

		startDate = moment().startOf('month').startOf('day').format()
		endDate = moment().format()

	} else if (frequency == 'range' && startDate && startDate != '' && endDate && endDate != '') {

		startDate = moment(startDate).format()
		endDate = moment(endDate).format()

	} else {
		return res.status(422).send({
			message: 'Invalid Data',
		})
	}

	let data = {
		data: [],
		totalRecords: 0,
		totalItems: 0,
		totalPrice: 0
	}
	let restaurantOrderReportData = await Order.findAll({
		include: [
			{
				model: OrderStatus,
				where: {
					slug: 'completed'
				}
			},
			{
				model: orderHistory,
				where: {
					[Op.and]: [{ action: 'fulfilled_by_restaurant' }, { createdAt: { [Op.between]: [startDate, endDate] } }],
				}
			},
			{
				model: Restaurant,
				where: {
					userId: userId
				}
			}
		]
	})

	if (restaurantOrderReportData && restaurantOrderReportData.length) {

		console.log(restaurantOrderReportData.length);
		let totalRecords = restaurantOrderReportData.length
		let totalItems = 0
		let totalPrice = 0
		for (let i = 0; i < restaurantOrderReportData.length; i++) {
			totalPrice = totalPrice + restaurantOrderReportData[i].orderSummary.total
			let cartProducts = restaurantOrderReportData[i].orderSummary.cart_products
			// let cartProductsQuantity = 0
			for (let j = 0; j < cartProducts.length; j++) {
				totalItems = totalItems + cartProducts[j].quantity
			}
		}
		data = {
			data: restaurantOrderReportData,
			totalRecords: totalRecords,
			totalItems,
			totalPrice
		}
	}


	let restaurantBookingReportData = await Booking.findAll({
		where: {
			createdAt: { [Op.between]: [startDate, endDate] }
		},
		include: [
			{
				model: OrderStatus,
				where: {
					slug: 'completed'
				}
			},
			{
				model: Restaurant,
				where: {
					userId: userId
				}
			}
		]
	})

	if (restaurantBookingReportData && restaurantBookingReportData.length) {

		let totalRecords = restaurantBookingReportData.length
		let totalItems = 0
		let totalPrice = 0
		for (let i = 0; i < restaurantBookingReportData.length; i++) {
			totalPrice = totalPrice + restaurantBookingReportData[i].bookingSummary.total
			let cartProducts = restaurantBookingReportData[i].bookingSummary.cart_products
			for (let j = 0; j < cartProducts.length; j++) {
				totalItems = totalItems + cartProducts[j].quantity
			}
		}
		data.data = [...data.data, ...restaurantBookingReportData]
		data.totalRecords = data.totalRecords + totalRecords
		data.totalItems = data.totalItems + totalItems
		data.totalPrice = data.totalPrice + totalPrice
		data.data = [...data.data, ...restaurantBookingReportData]
		data.data = [...data.data, ...restaurantBookingReportData]
	}
	if (data.data && data.data.length) {
		data.data = data.data.sort((a, b) => b.createdAt - a.createdAt)
	}

	return res.send(data)
}

