// Libraries
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const axios = require("axios");
const moment = require("moment");

// Custom Libraries
const rpcClient = require("../../lib/rpcClient");
const { sequelize_conn } = require("../../../config/database");

// Modals
var Booking = require("../SqlModels/Booking");
var OrderStatus = require("../SqlModels/OrderStatus");
var Cart = require("../SqlModels/Cart");
var CartProduct = require("../SqlModels/CartProduct");
const { Restaurant } = require("../SqlModels/Restaurant");
const DashboardCard = require("../SqlModels/dashboardCard");
const OrderHistory = require("../SqlModels/OrderHistory");
const Review = require('../SqlModels/Review');

// helpers
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')
const general_helper = require("../../helpers/general_helper");
const bookingHelper = require("../../helpers/bookingHelper");
const { getCartData } = require('../../helpers/cartHelper');
const { saveOrderHistory } = require("../../helpers/general_helper");
const { refundToWallet } = require('../../helpers/rpcHelper');

// Constants
const {
	MAIN_SERVICE_URL,
	BASIC_AUTH_USER,
	BASIC_AUTH_PASSWORD,
} = require("../../../config/constants");
const { REFUNDABLE_PAYMENT_METHODS } = require('../Constants/app.constants');


exports.getAll = async function (req, res) {
	let size = req.query.size ? Number(req.query.size) : 10;
	let pageNo = req.query.pageNo ? Number(req.query.pageNo) : 1;
	let type = req.query.type ? req.query.type : "active";

	let status = req.query.status ? req.query.status : null;
	let search = req.query.search ? req.query.search : null;
	let restaurantId = req.query.branchId ? req.query.branchId : null;
	let startDate = req.query.startDate ? req.query.startDate : null;
	let endDate = req.query.endDate
		? req.query.endDate
		: moment().format("YYYY-MM-DD hh:mm:ss");

	let offset = 0;
	let pagination = {};

	if (!Number.isNaN(size)) {
		if (pageNo > 1) {
			offset = size * pageNo - size;
		}
		pagination.limit = size;
		pagination.offset = offset;
		pagination.pageNo = pageNo;
	}

	// if (pageNo > 1) {
	//   offset = size * pageNo - size;
	// }


	// pagination.limit = size;
	// pagination.offset = offset;
	// pagination.pageNo = pageNo;
	let userId = req.user.id;

	let agentRoles = await general_helper.getAgentRoles();

	if (req.user.roleName === "admin" || req.user.roleName === "provider" || agentRoles.includes(req.user.roleName)) {
		let bookingWhere = {};
		let statusWhere = {};
		let restaurantWhere = {};

		if (status) {
			statusWhere.slug = status;
		}

		if (req.user.roleName === "provider") {
			restaurantWhere.providerId = req.user.id;
		}

		if (restaurantId) {
			restaurantWhere.id = Number(restaurantId);
		}

		if (search) {
			bookingWhere.bookingId = {
				[Op.like]: `%${search}%`,
			};
		}

		if (startDate) {
			bookingWhere.createdAt = {
				[Op.between]: [startDate, endDate],
			};
		}
		console.log('booking where =>', bookingWhere);
		console.log('restaurant where =>', restaurantWhere);
		Booking.findAll({
			where: bookingWhere,
			include: [
				{
					model: OrderStatus,
					where: statusWhere,
					attributes: ["name", "slug"],
					include: { model: DashboardCard, attributes: [] },
				},
				{
					model: Restaurant,
					where: restaurantWhere,
					attributes: [
						"id",
						"image",
						"name",
						"currency",
						"deliveryCharges",
						"address",
						"specialInstructions"
					],
				},
				{
					model: Review,
					where: {
						type: 'booking'
					},
					required: false
				}
			],
			order: [["id", "DESC"]],
			attributes: {
				exclude: ["createdAt", "updatedAt"],
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
				],
			},
			...pagination,
		})
			.then(async (bookingData) => {
				if (bookingData && bookingData.length) {
					let userIds = [];
					bookingData.map((item) => {
						if (!userIds.includes(item.userId)) {
							userIds.push(item.userId);
						}
					});
					rpcClient.UserService.GetUsers(
						{ ids: userIds },
						function (err, response) {
							if (err) {
								console.log(err);
								return res.status(500).send({
									message: "Unable to get users this time.",
								});
							}

							if (!response || !response.data) {
								sequelizeTransaction.rollback();
								return res.status(500).send({
									message: "Unable to get users this time.",
								});
							}
							let users = JSON.parse(response.data);
							let dataToSend = [];
							bookingData.map((item) => {
								item = item.toJSON();
								users.map((userData) => {
									if (userData.id === item.userId) {
										item.user = userData;
									}
								});
								dataToSend.push(item);
							});
							console.log('dataToSend =>', dataToSend);
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
				return respondWithError(req, res, '', null, 500)
			});
	} else {
		let data = {
			activeBookings: [],
			pastBookings: [],
		};
		let where = {};
		if (type === "active") {
			where.slug = {
				[Op.notIn]: ["completed", "cancelled"],
			};
		} else {
			where.slug = {
				[Op.in]: ["cancelled", "completed"],
			};
		}

		Booking.findAll({
			where: {
				userId,
			},
			include: [
				{
					model: OrderStatus,
					where: where,
					attributes: ["name", "slug"],
					include: { model: DashboardCard, attributes: [] },
				},
				{ model: Restaurant },
				{
					model: Review,
					where: {
						type: 'booking'
					},
					required: false
				}
			],
			order: [["id", "DESC"]],
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
			...pagination,
		})
			.then(async (bookingData) => {
				if (bookingData && bookingData.length) {
					if (type === "active") {
						data.activeBookings = bookingData;
					} else {
						data.pastBookings = bookingData;
					}
					return res.send({
						data: data,
					});
				} else {
					return res.send({
						data: data,
					});
				}
			})
			.catch((err) => {
				console.log(err);
				return respondWithError(req, res, '', null, 500)
			});
	}
};

exports.getActiveBooking = async function (req, res) {
	let userId = req.user.id;
	OrderStatus.findAll({
		where: { deleteStatus: false },
		include: [
			{
				model: DashboardCard,
				attributes: [],
				where: { slug: "dine-in" },
				through: { attributes: [] },
			},
		],
		order: [["sortOrder", "ASC"]],
	})
		.then((data) => {
			let completedStatusId = data.find((item) => item.slug === "completed");

			let bookingStatuses = [];
			Booking.findOne({
				where: {
					userId,
					[Op.not]: {
						BookingStatusId: completedStatusId.id,
					},
				},
				include: [{ model: Restaurant }],
				attributes: {
					exclude: ["createdAt", "updatedAt"],
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
					],
				},
			})
				.then(async (bookingData) => {
					if (bookingData) {
						bookingData = bookingData.toJSON();

						data.map((item) => {
							let bookingStatus = item.toJSON();
							if (item.id == bookingData.bookingStatusId) {
								bookingStatus.isActive = true;
							} else {
								bookingStatus.isActive = false;
							}
							bookingStatuses.push(bookingStatus);
						});
						bookingData.bookingStatuses = bookingStatuses;
						return res.send({
							data: bookingData,
						});
					} else {
						return res.status(400).send({
							message: "Unable to find booking data",
						});
					}
				})
				.catch((err) => {
					console.log(err);
					return respondWithError(req, res, '', null, 500)
				});
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500)
		});
};

exports.getOne = async function (req, res) {
	let userId = req.user.id;
	let id = req.params.id;

	Booking.findOne({
		where: {
			userId,
			[Op.or]: [
				{
					id: id,
				},
				{
					bookingId: `#${id}`,
				},
			],
		},
		include: [
			{ model: Restaurant },
			{
				model: OrderStatus,
				attributes: ["name", "slug"],
				include: { model: DashboardCard, attributes: [] },
			},
			{
				model: Review,
				where: {
					type: 'booking'
				},
				required: false
			}
		],
		attributes: {
			exclude: ["createdAt", "updatedAt"],
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
			],
		},
	})
		.then(async (bookingData) => {
			if (bookingData) {
				// bookingData = bookingData.toJSON();
				// let dashboardCardId = bookingData.bookingSummary.dashboardCardId;
				// let dashboardCardData = await DashboardCard.findOne({
				// 	where: { id: dashboardCardId },
				// });

				// OrderStatus.findAll({
				// 	where: { deleteStatus: false },
				// 	include: [
				// 		{
				// 			model: DashboardCard,
				// 			attributes: [],
				// 			where: { id: dashboardCardId },
				// 			through: { attributes: [] },
				// 		},
				// 	],
				// 	order: [["sortOrder", "ASC"]],
				// })
				// 	.then((data) => {
				// 		// console.log(data);
				// 		let bookingStatuses = [];
				// 		data.map((item) => {
				// 			let bookingStatus = item.toJSON();
				// 			if (item.id == bookingData.bookingStatusId) {
				// 				bookingStatus.isActive = true;
				// 			} else {
				// 				bookingStatus.isActive = false;
				// 			}
				// 			bookingStatuses.push(bookingStatus);
				// 		});
				// 		bookingData.bookingStatuses = bookingStatuses;


				// 	})
				// 	.catch((err) => {
				// 		console.log(err);
				// 		return res.status(500).send({
				// 			message: "Internal Server Error.",
				// 		});
				// 	});
				return res.send({
					data: bookingData,
				});
			} else {
				return res.status(400).send({
					message: "Unable to find order data",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500)
		});
};

exports.post = async function (req, res) {
	const sequelizeTransaction = await sequelize_conn.transaction();
	try {
		let userId = req.user.id;

		let bookingDate = req.body.bookingDate;
		let bookingTime = req.body.bookingTime;

		let geoLocation = null;
		let parseData = general_helper.IsValidJSONString(req.headers['geolocation'])
		if (parseData) {
			geoLocation = parseData
		}

		let bookingDateTime = moment(`${bookingDate} ${bookingTime}`).format(
			"YYYY-MM-DD HH:mm:ss"
		);

		console.log("booking time:", bookingDateTime);
		let verifyAlreadyBooked = await bookingHelper.verifyAlreadyBooked(
			bookingDate,
			bookingTime,
			userId
		);

		if (verifyAlreadyBooked) {
			sequelizeTransaction.rollback();
			return res.status(400).send({
				message: "Booking time slot is not available.",
			});
		}

		let cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long);


		let specialInstructions = req.body.specialInstructions;

		let guests = req.body.guests;
		let paymentMethodId = req.body.paymentMethodId;
		let lat = req.body.lat;
		let long = req.body.long;
		if (cartData && Object.keys(cartData).length) {
			if (cartData.unavailableItems.length) {
				sequelizeTransaction.rollback();
				return res.status(400).send({ message: "Some of items are not available anymore from cart. Please update your cart.", data: cartData.unavailableItems });
			}
			if (cartData.dashboard_card.slug !== "dine-in") {
				return res.status(400).send({ message: "Unauthorized Access" });
			}
			if (
				cartData.restaurant.capacity &&
				cartData.restaurant.capacity < guests
			) {
				return res.status(400).send({
					message:
						"Error: Restaurant Capacity not enough to serve you at this moment.",
				});
			}
			rpcClient.BillingService.GetPaymentMethods(
				{
					id: paymentMethodId,
				},
				async (error, respPaymentMethods) => {
					if (error) {
						return respondWithError(req, res, '', null, 500)
					}
					try {
						let paymentMethodData = JSON.parse(respPaymentMethods.data);

						if (!paymentMethodData) {
							return res.status(400).send({
								message: "Error: Unable to find payment method.",
							});
						}

						if (paymentMethodData.slug === "cash_payment") {
							return res.status(400).send({
								message: "Error: Payment method not allowed.",
							});
						}

						let cardDataJson = cartData;

						cardDataJson.guests = guests;
						cardDataJson.specialInstructions = specialInstructions;
						cardDataJson.bookingTime = bookingTime;
						cardDataJson.bookingDate = bookingDate;
						cardDataJson.paymentMethod = {
							id: paymentMethodData.id,
							name: paymentMethodData.name,
							slug: paymentMethodData.slug,
						};
						cardDataJson.lat = lat;
						cardDataJson.long = long;

						let restaurantId = cardDataJson.restaurant.id;
						let dashboardCardId = cardDataJson.dashboardCardId;

						let bookingStatuses = await OrderStatus.findAll(
							{
								where: { deleteStatus: false },
								include: {
									model: DashboardCard,
									attributes: [],
									where: { id: dashboardCardId },
									through: { attributes: [] },
								},
							},
							{ transaction: sequelizeTransaction }
						);

						let pendingOrderStatus = null;
						let confirmedOrderStatus = null;

						bookingStatuses.map((orderStatus) => {
							// console.log(orderStatus)
							if (orderStatus.slug === "pending") {
								pendingOrderStatus = orderStatus;
							} else if (orderStatus.slug === "confirmed") {
								confirmedOrderStatus = orderStatus;
							}
						});

						if (!pendingOrderStatus || !confirmedOrderStatus) {
							sequelizeTransaction.rollback();
							return res.status(400).send({
								message: "Error: Unable to find order status.",
							});
						}

						// return res.send('test')

						// console.log(bookingDateTime)
						let booking = new Booking({
							userId: req.user.id,
							bookingId: "",
							bookingDateTime: bookingDateTime,
							bookingSummary: cardDataJson,
							bookingStatusId: pendingOrderStatus.id,
							restaurantId: restaurantId,
							dashboardCardId: dashboardCardId,
						});

						booking
							.save({ transaction: sequelizeTransaction })
							.then(async (bookingData) => {
								// sequelizeTransaction.commit()
								if (paymentMethodData.slug !== "paypal") {
									Cart.destroy({
										where: {
											userId: userId,
										},
										transaction: sequelizeTransaction,
									});
									await CartProduct.destroy({
										where: {
											cartId: cartData.id,
										},
										transaction: sequelizeTransaction,
									});
								}

								let paymentData = req.body.paymentData;
								rpcClient.BillingService.ServiceTransaction(
									{
										user: JSON.stringify(req.user),
										amount: cartData.total,
										paymentMethodSlug: paymentMethodData.slug,
										orderId: bookingData.id,
										paymentData: JSON.stringify(paymentData),
										type: "booking",
									},
									async (err, respTransactionData) => {
										if (err) {
											console.log(err.message);
											sequelizeTransaction.rollback();
											return respondWithError(req, res, '', null, 500)
										}

										if (!respTransactionData || !respTransactionData.data) {
											sequelizeTransaction.rollback();
											return res.status(500).send({
												message: "Error! transaction could not be processed",
											});
										}

										try {
											let transactionData = JSON.parse(
												respTransactionData.data
											);

											if (transactionData?.completedBySplitPayment) {
												cardDataJson.paymentMethod = {
													id: transactionData?.splitPaymentMethod?.id,
													name: transactionData?.splitPaymentMethod?.name,
													slug: transactionData?.splitPaymentMethod?.slug,
												};
												booking.bookingSummary = cardDataJson
												await booking.save({ transaction: sequelizeTransaction });
												await Cart.destroy({
													where: {
														userId: userId,
													},
													transaction: sequelizeTransaction,
												});
												await CartProduct.destroy({
													where: {
														cartId: cartData.id,
													},
													transaction: sequelizeTransaction,
												});
											}

											if (cartData.promoCode) {
												rpcClient.BillingService.AddPromoHistory(
													{
														userId: userId,
														promoCode: cartData.promoCode,
													},
													async (error, respPromoCode) => {
														console.log("Promo Code History Error.", error);
														console.log(
															"Promo Code History Update.",
															respPromoCode
														);
													}
												);
											}


											if (
												transactionData.pendingAmount > 0 &&
												!transactionData.instantPayment &&
												paymentMethodData.slug !== "cash_payment"
											) {
												console.log("transactionData:", transactionData);
												sequelizeTransaction.commit();
												return res.send({
													status: true,
													data: transactionData.paymentResponse,
												});
											}

											booking.bookingStatusId = confirmedOrderStatus.id;
											await booking.save({ transaction: sequelizeTransaction });

											console.log(bookingData.bookingSummary);
											let bookingDataJson = bookingData.toJSON();

											let bookingStatusesJson = [];
											bookingStatuses.map((item) => {
												let orderStatus = item.toJSON();
												if (orderStatus.id == bookingDataJson.bookingStatusId) {
													orderStatus.isActive = true;
												} else {
													orderStatus.isActive = false;
												}
												bookingStatusesJson.push(orderStatus);
											});

											bookingDataJson.bookingStatuses = bookingStatusesJson;
											// bookingDataJson.bookingSummary = bookingData.bookingSummary;
											bookingDataJson.bookingSummary = typeof bookingData.bookingSummary === 'string' ? JSON.parse(bookingData.bookingSummary) : bookingData.bookingSummary;

											await sequelizeTransaction.commit();

											let notificationData = {
												userId: cartData.restaurant.userId,
												title: "New Booking Request",
												body: "New Booking has been received. Click to check.",
												data: {
													action: "new_booking",
													data: { id: bookingDataJson.id },
												},
											};

											general_helper.sendNotification(notificationData);

											return res.send({
												message: "Booking has been placed successfully.",
												data: bookingDataJson,
											});
										} catch (error) {
											console.log(error);
											sequelizeTransaction.rollback();
											return respondWithError(req, res, '', null, 500)
										}
									}
								);
								return;
							})
							.catch((err) => {
								console.log(err);
								sequelizeTransaction.rollback();
								return respondWithError(req, res, '', null, 500)
							});
					} catch (error) {
						console.log(error);
						sequelizeTransaction.rollback();
						return respondWithError(req, res, '', null, 500)
					}
				}
			);
			return;
		} else {
			sequelizeTransaction.rollback();
			return res.status(400).send({
				message: "Error: Cannot place order, Your cart is empty.",
			});
		}
	} catch (error) {
		console.log(error);
		sequelizeTransaction.rollback();
		return res.status(500).send({
			message: "Unable to place an order.",
		});
	}
};

exports.verifyBookingTime = async function (req, res) {
	let bookingDate = req.body.bookingDate;
	let bookingTime = req.body.bookingTime;
	let userId = req.user.id;

	let bookingDateTime = moment(`${bookingDate} ${bookingTime}`).format(
		"YYYY-MM-DD HH:mm:ss"
	);

	console.log("booking time:", bookingDateTime);
	let verifyAlreadyBooked = await bookingHelper.verifyAlreadyBooked(
		bookingDate,
		bookingTime,
		userId
	);

	if (verifyAlreadyBooked) {
		sequelizeTransaction.rollback();
		return res.status(400).send({
			message: "Booking time slot is not available.",
		});
	}
	return res.send({
		status: false,
		message: "booking can be placed on given date time",
	});
};

// exports.put = async function (req, res) {

//     let userId = req.user.id
//     let orderId = req.body.orderId
//     let restaurantId = req.body.restaurantId
//     let orderStatusId = req.body.orderStatusId

//     //CHECK IF USER OWNS THIS RESTAURANT
//     OrderStatus.findOne({
//         where: {
//             id: orderStatusId
//         }
//     }).then(item => {
//         if (item) {
//             Restaurant.findOne({
//                 where: {
//                     userId: userId,
//                     deleteStatus: false
//                 }
//             }).then(item => {
//                 if (item) {
//                     Order.findOne({
//                         where: {
//                             restaurantId: restaurantId,
//                             id: orderId
//                         },
//                     }).then(async orderData => {

//                         if (orderData) {
//                             orderData.orderStatus = orderStatusId
//                             orderData.save()
//                             return res.send({
//                                 data: orderData
//                             })
//                         } else {
//                             return res.status(400).send({
//                                 message: 'Unable to find order data',
//                             })
//                         }
//                     }).catch(err => {
//                         console.log(err);
//                         return res.status(500).send({
//                             message: 'Internal Server Error.',
//                         })
//                     })
//                 } else {
//                     return res.status(400).send({
//                         message: 'Error: Unauthorize access',
//                     })
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 return res.status(500).send({
//                     message: 'Internal Server Error.',
//                 })
//             })
//         } else {
//             return res.status(400).send({
//                 message: 'Error: Unauthorize access',
//             })
//         }
//     }).catch(err => {
//         console.log(err);
//         return res.status(500).send({
//             message: 'Internal Server Error.',
//         })
//     })

// }

exports.confirmBooking = async function (call, callback) {
	try {
		let bookingStatuses = await OrderStatus.findAll({
			where: { deleteStatus: false },
		});

		let pendingOrderStatus = null;
		let confirmedOrderStatus = null;

		bookingStatuses.map((orderStatus) => {
			// console.log(orderStatus)
			if (orderStatus.slug === "pending") {
				pendingOrderStatus = orderStatus;
			} else if (orderStatus.slug === "confirmed") {
				confirmedOrderStatus = orderStatus;
			}
		});

		if (!pendingOrderStatus || !confirmedOrderStatus) {
			sequelizeTransaction.rollback();
			callback({
				message: "Error: Unable to find order status.",
			});
			return;
		}

		let bookingId = call.request.id;
		console.log("bookingId:", bookingId);

		let booking = await Booking.findOne({
			where: {
				id: bookingId,
			},
		});

		if (!booking) {
			callback({
				status: false,
				message: "Error: Order not found",
			});
		}

		booking.bookingSummary = booking.bookingSummary;
		booking.bookingStatusId = confirmedOrderStatus.id;
		await booking.save();

		let bookingDataJson = booking.toJSON();

		let bookingStatusesJson = [];

		bookingStatuses.map((item) => {
			let bookingStatus = item.toJSON();
			if (bookingStatus.id == bookingDataJson.bookingStatusId) {
				bookingStatus.isActive = true;
			} else {
				bookingStatus.isActive = false;
			}
			bookingStatusesJson.push(bookingStatus);
		});

		bookingDataJson.bookingStatuses = bookingStatusesJson;
		bookingDataJson.bookingSummary = bookingDataJson.bookingSummary;

		let notificationData = {
			title: "New Booking Request",
			body: "New Booking has been received. Click to check.",
			data: { action: "new_booking", data: { id: bookingDataJson.id } },
		};

		general_helper.sendNotificationWithRestaurantId(
			bookingDataJson.restaurantId,
			notificationData
		);

		return callback(null, {
			status: true,
			data: JSON.stringify(bookingDataJson),
		});
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500)
	}
};



exports.update = async function (req, res) {
	let userId = req.user.id;
	let id = req.body.id;
	let action = req.body.action;

	// let orderStatusWhere = { slug: "confirmed" }
	Booking.findOne({
		where: {
			id,
			userId: userId
		},
		include: [
			{
				model: OrderStatus,
				attributes: ["id", "name", "slug"],
			},
			{
				model: Restaurant,
			},
		],
	}).then(async (bookingData) => {
		if (bookingData) {
			let where = {};
			let notificationData = {
				userId: bookingData.restaurant.userId,
				body: "",
				title: "",
				data: { action: "", data: {} },
			};
			let historyObject = {
				orderId: bookingData.id,
			};
			console.log(bookingData)
			if (action === "arrived") {
				if (bookingData.order_status.slug === "processed" || bookingData.order_status.slug === "ready_to_serve") {
					historyObject.action = "booking_user_arrived_at_restaurant";
					notificationData.title = "Booking Update.";
					notificationData.body =
						"Booking user has been arrived at restaurant. Check Details.";
					where.slug = "arrived";
					notificationData.data.action = "booking_user_arrived";
				} else {
					return res.status(400).send({
						message: "Unable to update booking status.",
					});
				}
			} else if (action === "cancelled" && (bookingData.order_status.slug === "confirmed" || bookingData.order_status.slug === "pending")) {

				historyObject.action = "booking_cancelled";
				notificationData.title = "Booking Update.";
				notificationData.body =
					"Booking user has been cancelled by Customer. Check Details.";
				where.slug = "cancelled";
				notificationData.data.action = "booking_cancelled";
			}
			else {
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
				if (action === "cancelled" && bookingData.bookingSummary
					&& bookingData.bookingSummary.paymentMethod
					&& (REFUNDABLE_PAYMENT_METHODS.includes(bookingData.bookingSummary.paymentMethod.slug))) {
					let refundData = {
						amount: bookingData.bookingSummary.total,
						userId: bookingData.userId,
						paymentSummary: { message: `Booking has been cancelled. Credits has been added to wallet."` },
						orderId: bookingData.id
					}
					let isRefunded = await refundToWallet(refundData)
					if (!isRefunded) {
						console.log("REFUND IS NOT ADDED IN USER ACCOUNT.")
					}
				}
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
										sequelize.fn(
											"CONVERT_TZ",
											sequelize.col("order_history.createdAt"),
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

				if (dataToSend.order_history) {
					dataToSend.acceptedOn = dataToSend.order_history.acceptedOn
					delete dataToSend.order_history
				}

				return res.send({
					message: `Booking has been marked as ${action}`,
					data: dataToSend,
				});
			} else {
				return res.status(400).send({
					message: "Unable to update booking status.",
				});
			}
		} else {
			return res.status(400).send({
				message: "Error: Booking not found.",
			});
		}
	}).catch((err) => {
		console.log(err);
		return res.status(500).send({
			message: "Internal Server Error.",
		});
	});
};
