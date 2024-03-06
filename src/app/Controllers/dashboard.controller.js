//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

const moment = require('moment')
const { Op } = require('sequelize')

// helpers
const Order = require('../SqlModels/Order');
const { Restaurant } = require('../SqlModels/Restaurant');
const OrderStatus = require('../SqlModels/OrderStatus');

exports.getAll = async function (req, res) {
	if (req.user.roleName != 'provider') {
		return res.status(400).send({
			message: "Error: Unauthorized Access."
		}) 
	}
	let startDate = req.query.startDate
	let endDate = req.query.endDate
	if (!startDate) {
		startDate = moment().subtract(7, 'days')
	}
	if (!endDate) {
		endDate = moment()
	}

	Restaurant.findAll({
		where: {
			providerId: req.user.id,
			deleteStatus: false
		}
	}).then(restaurantData => {
		if (restaurantData && restaurantData.length) {
			let data = {
				branches: 0,
				activeOrders: 0,
				pendingOrders: 0,
				deliveredOrders: 0,
				cancelledOrders: 0,
				productsSold: 0,
				salePrice: 0,
				hotItems: {},
				recentOrders: []
			}

			data.branches = restaurantData.length
			let restaurantIds = restaurantData.map(item => item.id)

			Order.findAll({
				where: {
					restaurantId: { [Op.in]: restaurantIds },
					createdAt: { [Op.between]: [startDate, endDate] }
				},
				include: OrderStatus
			}).then(ordersData => {
				if (ordersData && ordersData.length) {
					// console.log(ordersData[0]);
					ordersData.map(item => {
						if (item.order_status.slug === 'confirmed') {
							data.pendingOrders++
						} else if (item.order_status.slug === 'processed') {
							data.activeOrders++
						} else if (item.order_status.slug === 'ready_for_delivery'
							|| item.order_status.slug === 'ready_for_pickup'
							|| item.order_status.slug === 'completed'
							|| item.order_status.slug === 'picked'
						) {
							data.deliveredOrders++
						} else if (item.order_status.slug === 'cancelled') {
							data.cancelledOrders++
						}

						data.salePrice += item.orderSummary.total
						item.orderSummary.cart_products.map(itemProduct => {
							data.productsSold += itemProduct.quantity
							data.hotItems[itemProduct.productData.name] = data.hotItems[itemProduct.productData.name] ? data.hotItems[itemProduct.productData.name] + itemProduct.quantity : itemProduct.quantity
						})
					})

					data.recentOrders = ordersData
					data.hotItems = Object.fromEntries(
						Object.entries(data.hotItems).sort(([, a], [, b]) => b - a)
					);

					return res.send({
						data: data
					})
				} else {
					return res.send({
						data: data
					})
				}

			}).catch(err => {
				console.log(err);
				res.send({
					data: data
				})
			})

		} else {
			return res.send({
				message: "Error: Data not found.",
				data: {}
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500)
	})
}