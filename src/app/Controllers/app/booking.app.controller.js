const { Op, Sequelize } = require("sequelize");
const axios = require("axios");
const moment = require("moment");
const rpcClient = require("../../../lib/rpcClient");

// Modals
var Booking = require("../../SqlModels/Booking");
var OrderStatus = require("../../SqlModels/OrderStatus");
// var Cart = require('../../SqlModels/Cart');
const { Restaurant } = require("../../SqlModels/Restaurant");
// const RestaurantFoodMenu = require('../../SqlModels/RestaurantFoodMenu');
// const RestaurantMenuProduct = require('../../SqlModels/RestaurantMenuProduct');
// const CartProductVariation = require('../../SqlModels/CartProductVariation');
// const CartVariationProduct = require('../../SqlModels/CartVariationProduct');
// const RestaurantMenuProductVariation = require('../../SqlModels/RestaurantMenuProductVariation');
// const VariationProduct = require('../../SqlModels/VariationProduct');
// const CartProduct = require('../../SqlModels/CartProduct');

// helpers
// const general_helper = require('../../../helpers/general_helper');
// const { MAIN_SERVICE_URL, BASIC_AUTH_USER, BASIC_AUTH_PASSWORD } = require('../../../../config/constants');
const DashboardCard = require("../../SqlModels/dashboardCard");
const { saveOrderHistory } = require("../../../helpers/general_helper");
const general_helper = require("../../../helpers/general_helper");
const OrderHistory = require("../../SqlModels/OrderHistory");
const sequelize = require("sequelize");

exports.getAll = async function (req, res) {
	let size = req.query.size ? Number(req.query.size) : 10;
	let pageNo = req.query.pageNo ? Number(req.query.pageNo) : 1;
	let offset = 0;
	if (pageNo > 1) {
		offset = size * pageNo - size;
	}
	let pagination = {};
	pagination.limit = size;
	pagination.offset = offset;
	pagination.pageNo = pageNo;

	let userId = req.user.id;
	let orderStatusType = req.query.listType;
	let orderStatusWhere = {};
	if (orderStatusType === "new") {
		orderStatusWhere.slug = "confirmed";
	} else if (orderStatusType === "active") {
		orderStatusWhere.slug = {
			[Op.in]: ["processed", "arrived", "ready_to_serve"],
		};
	} else if (orderStatusType === "past") {
		orderStatusWhere.slug = {
			[Op.in]: ["cancelled", "completed"],
		};
	}

	Booking.findAll({
		include: [
			{
				model: OrderStatus,
				where: orderStatusWhere,
				attributes: ["id", "name", "slug"],
			},
			{
				model: Restaurant,
				where: {
					userId: userId,
				},
			},
			{
				model: OrderHistory,
				where: {
					action: 'booking_accepted_by_restaurant'
				},
				attributes: {
					include: [
						[
							Sequelize.fn(
								"CONVERT_TZ",
								Sequelize.col("order_history.createdAt"),
								"+00:00",
								"+05:00"
							),
							"acceptedOn",
						]
					], exclude: ["orderId", "actionData", "updatedAt"]
				},
				required: false
			},
		],
		order: [["id", "DESC"]],
		attributes: {
			include: [
				[
					Sequelize.fn(
						"CONVERT_TZ",
						Sequelize.col("bookings.createdAt"),
						"+00:00",
						"+05:00"
					),
					"createdAt",
				],
				[
					Sequelize.fn(
						"CONVERT_TZ",
						Sequelize.col("bookings.updatedAt"),
						"+00:00",
						"+05:00"
					),
					"updatedAt",
				],
				[
					sequelize.fn(
						"CONVERT_TZ",
						sequelize.col("bookings.bookingDateTime"),
						"+00:00",
						"+05:00"
					),
					"bookingDateTime",
				],
			],
		},
		...pagination,
	}).then(async (bookingData) => {
		console.log(bookingData.length)
		if (bookingData && bookingData.length) {
			let userIds = bookingData.map((item) => item.userId);
			rpcClient.UserService.GetUsers(
				{ ids: userIds },
				function (err, response) {
					if (err) {
						console.log(err);
						return res.status(500).send({
							message: "Unable to get riders this time.",
						});
					}

					if (!response || !response.data) {
						sequelizeTransaction.rollback();
						return res.status(500).send({
							message: "Unable to get riders this time.",
						});
					}
					let users = JSON.parse(response.data);
					let dataToSend = [];
					bookingData.map((item) => {
						item = item.toJSON();
						item.user = users.find((userData) => userData.id === item.userId);
						if (item.order_history) {
							item.acceptedOn = item.order_history.acceptedOn
							delete item.order_history
						}
						dataToSend.push(item);
					});

					return res.send({
						data: dataToSend,
					});
				}
			);
		} else {
			return res.send({
				data: [],
			});
		}
	})
		.catch((err) => {
			console.log(err);
			return res.status(500).send({
				message: "Internal Server Error.",
			});
		});
};

exports.getOne = async function (req, res) {
	let userId = req.user.id;
	let id = req.params.id;

	Booking.findOne({
		where: {
			id,
		},
		include: [
			{
				model: OrderStatus,
				attributes: ["id", "name", "slug"],
			},
			{
				model: Restaurant,
				where: {
					userId: userId,
				},
			},
			{
				model: OrderHistory,
				where: {
					action: 'booking_accepted_by_restaurant'
				},
				attributes: {
					include: [
						[
							Sequelize.fn(
								"CONVERT_TZ",
								Sequelize.col("order_history.createdAt"),
								"+00:00",
								"+05:00"
							),
							"acceptedOn",
						]
					], exclude: ["orderId", "actionData", "updatedAt"]
				},

				required: false
			},
		],
		attributes: {
			exclude: ["createdAt", "updatedAt", "bookingDateTime"],
			include: [
				[
					sequelize.fn(
						"CONVERT_TZ",
						sequelize.col("bookings.createdAt"),
						"+00:00",
						"+05:00"
					),
					"createdAt",
				],
				[
					sequelize.fn(
						"CONVERT_TZ",
						sequelize.col("bookings.updatedAt"),
						"+00:00",
						"+05:00"
					),
					"updatedAt",
				],
				[
					sequelize.fn(
						"CONVERT_TZ",
						sequelize.col("bookings.bookingDateTime"),
						"+00:00",
						"+05:00"
					),
					"bookingDateTime",
				],
			],
		},
	}).then(async (orderData) => {
		if (orderData) {
			orderData = orderData.toJSON()
			if (orderData.order_history) {
				orderData.acceptedOn = orderData.order_history.acceptedOn
				delete orderData.order_history
			}
			return res.send({
				data: orderData,
			});
		} else {
			return res.send({
				data: {},
			});
		}
	}).catch((err) => {
		console.log(err);
		return res.status(500).send({
			message: "Internal Server Error.",
		});
	});
};

exports.update = async function (req, res) {
	let userId = req.user.id;
	let id = req.body.id;
	let action = req.body.action;
	let rejectionReason = req.body.rejectionReason;

	// let orderStatusWhere = { slug: "confirmed" }
	Booking.findOne({
		where: {
			id,
		},
		include: [
			{
				model: OrderStatus,
				attributes: ["id", "name", "slug"],
			},
			{
				model: Restaurant,
				where: {
					userId: userId,
				},
			},
		],
	}).then(async (bookingData) => {
		if (bookingData) {
			let where = {};
			let notificationData = {
				userId: bookingData.userId,
				body: "",
				title: "",
				data: { action: "", data: {} },
			};
			let historyObject = {
				orderId: bookingData.id,
			};
			if (action === "accepted") {
				if (bookingData.order_status.slug === "confirmed") {
					historyObject.action = "booking_accepted_by_restaurant";
					notificationData.title = "Booking Update.";
					notificationData.body =
						"Booking has been accepted by restaurant. Check Details.";
					where.slug = "processed";
					notificationData.data.action = "booking_accepted";
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
			} else if (action === "declined") {
				historyObject.action = "booking_declined_by_restaurant";
				notificationData.title = "Booking Update.";
				notificationData.body = "Booking has been rejected by restaurant. Check Details.";

				if (rejectionReason) {
					bookingData.bookingSummary.rejectionReason = rejectionReason;
				}

				notificationData.data.action = "booking_declined";

				if (bookingData.order_status.slug === "confirmed") {
					where.slug = "cancelled";
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
			} else if (action === "ready") {
				historyObject.action = "booking_ready_by_restaurant";
				notificationData.title = "Booking Update.";
				notificationData.body = "Booking has been ready by restaurant. Check Details.";


				notificationData.data.action = "booking_ready";

				if (bookingData.order_status.slug === "processed") {
					where.slug = "ready_to_serve";
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
			} else if (action === "completed") {
				historyObject.action = "booking_completed_by_restaurant";
				notificationData.title = "Booking Update.";
				notificationData.body = "Booking has been completed by restaurant. Check Details.";


				notificationData.data.action = "booking_completed";

				if (bookingData.order_status.slug === "ready_to_serve") {
					where.slug = "completed";
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
				let rewardPointData = {
					restaurantName: bookingData.restaurant.name,
					number: bookingData.bookingId,
				}


				rpcClient.UserService.UpdateUserRewardPoints({
					userId: Number(bookingData.userId),
					relevantId: bookingData.id,
					type: 'booking',
					points: bookingData.bookingSummary.total,
					data: JSON.stringify(rewardPointData)
				}, (err, response) => {
					if (err) console.log('rewardPointRpcError', err)
					console.log('rewardPointsRpcResponse', response)
				})

			} else {
				return res.status(400).send({
					message: "Error: Unauthorized Access.",
				});
			}

			let orderStatus = await OrderStatus.findOne({ where });
			if (orderStatus) {
				bookingData.bookingStatusId = orderStatus.id;
				bookingData.bookingSummary = bookingData.bookingSummary;
				await bookingData.save();
				await saveOrderHistory(historyObject);
				let dataToSend = await Booking.findOne({
					where: {
						id: bookingData.id,
					},
					include: [
						{
							model: OrderStatus,
							attributes: ["id", "name", "slug"],
						},
						{
							model: OrderHistory,
							where: {
								action: 'booking_accepted_by_restaurant'
							},
							attributes: {
								include: [
									[
										Sequelize.fn(
											"CONVERT_TZ",
											Sequelize.col("order_history.createdAt"),
											"+00:00",
											"+05:00"
										),
										"acceptedOn",
									]
								], exclude: ["orderId", "actionData", "updatedAt"]
							},

							required: false
						},
					],
				});

				notificationData.data.data = { id: dataToSend.id };

				general_helper.sendNotification(notificationData);
				dataToSend = dataToSend.toJSON();
				dataToSend.restaurant = bookingData.restaurant
				if (dataToSend.order_history) {
					dataToSend.acceptedOn = dataToSend.order_history.acceptedOn
					delete dataToSend.order_history
				}
				if (action === "accepted") {
					let emailData = {
						restaurantName: bookingData.restaurant.name,
						bookingId: bookingData.bookingId,
						bookingDate: moment(bookingData.bookingDateTime).format("YYYY-MM-DD"),
						bookingTime: moment(bookingData.bookingDateTime).format("hh:mm A"),
						guests: bookingData.bookingSummary.guests
					}

					// console.log(emailData.products)

					rpcClient.MainService.SendEmailByUserId({
						subject: 'Booking Has been placed confirmed.',
						userId: bookingData.userId,
						template: 'user/confirmedBooking.pug',
						templateData: JSON.stringify(emailData)
					}, function (error, sendEmailResponse) {
						console.log('email error', error, sendEmailResponse)
					})
				}
				return res.send({
					message: `Booking has been marked as ${action}`,
					data: dataToSend,
				});
			} else {
				return res.status(400).send({
					message: "Unable to update order status.",
				});
			}
		} else {
			return res.status(400).send({
				message: "Unable to update booking status.",
			});
		}
	}).catch((err) => {
		console.log(err);
		return res.status(500).send({
			message: "Internal Server Error.",
		});
	});
};
