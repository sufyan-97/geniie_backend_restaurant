// Libraries
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const axios = require("axios");
const moment = require("moment");
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// Custom Libraries
const rpcClient = require("../../lib/rpcClient");
const { sequelize_conn } = require("../../../config/database");

// Modals
const Order = require("../SqlModels/Order");
const OrderStatus = require("../SqlModels/OrderStatus");
const Cart = require("../SqlModels/Cart");
const { Restaurant } = require("../SqlModels/Restaurant");
const DashboardCard = require("../SqlModels/dashboardCard");
const Review = require("../SqlModels/Review");
const OrderHistory = require("../SqlModels/OrderHistory");
const ProductNotAvailable = require("../SqlModels/ProductNotAvailable");
const UserSetting = require("../SqlModels/UserSetting");
const CartProduct = require("../SqlModels/CartProduct");
const SupportRelatedReason = require("../SqlModels/SupportRelatedReason");

// helpers
const general_helper = require("../../helpers/general_helper");
const rpcHelper = require("../../helpers/rpcHelper");
const { getCartData } = require("../../helpers/cartHelper");
const { refundToWallet } = require("../../helpers/rpcHelper");

// Constants
const {
	MAIN_SERVICE_URL,
	BASIC_AUTH_USER,
	BASIC_AUTH_PASSWORD,
} = require("../../../config/constants");

const { REFUNDABLE_PAYMENT_METHODS } = require("../Constants/app.constants");
const appConstants = require("../Constants/app.constants");

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
	let userId = req.user.id;

	let agentRoles = await general_helper.getAgentRoles();

	if (req.user.roleName === "provider" || req.user.roleName === "admin" || agentRoles.includes(req.user.roleName)) {
		let orderWhere = {};
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

		if (req.user.roleName === "admin" || agentRoles.includes(req.user.roleName)) {

			let userEmail = req.query.userEmail
			let riderEmail = req.query.riderEmail
			let restaurantName = req.query.restaurantName

			if (userEmail || riderEmail) {


				let rpcRequestData = {
					user: userEmail ? { email: userEmail } : null,
					rider: riderEmail ? { email: riderEmail } : null,
				}

				const GetUsers = () => {
					return new Promise((resolve, reject) => {
						rpcClient.UserService.GetUsersByType({ status: true, data: JSON.stringify(rpcRequestData) }, function (error, usersData) {
							if (error) {
								console.log(error);
								return reject(error)
							}
							return resolve(usersData)
						})
					})
				}

				let usersData = await GetUsers()

				let users = []
				users = usersData ? JSON.parse(usersData.data) : [];

				let rpcUserId = 0, rpcRiderId = 0;

				users.forEach(user => {

					if (user.roles[0].roleName === 'user') {
						rpcUserId = user.id
					}

					if (user.roles[0].roleName === 'rider') {
						rpcRiderId = user.id
					}

				});

				if (userEmail) {
					orderWhere.userId = rpcUserId
				}

				if (riderEmail) {
					orderWhere.riderId = rpcRiderId
				}

			}

			if (restaurantName) {
				restaurantWhere.name = {
					[Op.like]: `%${restaurantName}%`,
				};
			}

		}

		if (search) {
			orderWhere.orderId = {
				[Op.like]: `%${search}%`,
			};
		}

		if (startDate) {
			orderWhere.createdAt = {
				[Op.between]: [startDate, endDate],
			};
		}

		Order.findAll({
			where: orderWhere,
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
						"userId",
						"specialInstructions"
					],
				},
				{
					model: Review,
					where: {
						type: 'order'
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
							sequelize.col("orders.createdAt"),
							"+00:00",
							"+05:00"
						),
						"createdAt",
					],
					[
						sequelize.fn(
							"CONVERT_TZ",
							sequelize.col("orders.updatedAt"),
							"+00:00",
							"+05:00"
						),
						"updatedAt",
					],
				],
			},
			...pagination,
		})
			.then(async (orderData) => {
				if (orderData && orderData.length) {
					let userIds = [];
					orderData.map((item) => {
						if (!userIds.includes(item.userId)) {
							userIds.push(item.userId);
						}
						if (item.acceptedByRider && item.riderId) {
							if (!userIds.includes(item.riderId)) {
								userIds.push(item.riderId);
							}
						}
						if (!userIds.includes(item.restaurant.userId)) {
							userIds.push(item.restaurant.userId);
						}
					});
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
							orderData.map((item) => {
								item = item.toJSON();
								users.map((userData) => {
									let role = userData?.roles ? userData.roles[0] : null
									let parentId = userData.parentId

									delete userData.roles
									delete userData.parentId
									delete userData.bank_account

									if (role?.roleName === 'rider') {
										userData.isRestaurantRider = false
										if (parentId)
											userData.isRestaurantRider = true
									}

									if (userData.id === item.userId) {
										item.user = userData;
									}
									if (userData.id === item.riderId) {
										item.rider = userData;
									}
									if (userData.id === item.restaurant.userId) {
										item.restaurantUser = userData;
									}
								});
								dataToSend.push(item);
							});

							return res.send({
								data: dataToSend,
							});
						}
					);
				} else {
					return res.send({
						data: orderData,
					});
				}
			})
			.catch((err) => {
				console.log(err);
				return res.status(500).send({
					message: "Internal Server Error.",
				});
			});
	} else {
		let data = {
			activeOrders: [],
			pastOrders: [],
		};
		let where = {};
		if (type === "active") {
			where.slug = {
				[Op.notIn]: ["pending", "completed", "cancelled"],
			};
		} else {
			where.slug = {
				[Op.in]: ["cancelled", "completed"],
			};
		}

		Order.findAll({
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
				{
					model: Restaurant,
					attributes: { exclude: ["createdAt", "updatedAt"] },
				},
				{
					model: Review,
					where: {
						type: 'order'
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
							sequelize.col("orders.createdAt"),
							"+00:00",
							"+05:00"
						),
						"createdAt",
					],
					[
						sequelize.fn(
							"CONVERT_TZ",
							sequelize.col("orders.updatedAt"),
							"+00:00",
							"+05:00"
						),
						"updatedAt",
					],
				],
			},
			...pagination,
		})
			.then(async (orderData) => {
				if (orderData && orderData.length) {

					let userIds = [];
					orderData.map((item) => {
						if (!userIds.includes(item.userId)) {
							userIds.push(item.userId);
						}
						if (item.acceptedByRider && item.riderId) {
							if (!userIds.includes(item.riderId)) {
								userIds.push(item.riderId);
							}
						}
						if (!userIds.includes(item.restaurant.userId)) {
							userIds.push(item.restaurant.userId);
						}
					});
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

							let newOrderData = orderData.map((item) => {
								item = item.toJSON();
								users.map((userData) => {
									let role = userData?.roles ? userData.roles[0] : null
									let parentId = userData.parentId

									delete userData.roles
									delete userData.parentId
									delete userData.bank_account

									if (role?.roleName === 'rider') {
										userData.isRestaurantRider = false
										if (parentId)
											userData.isRestaurantRider = true
									}

									if (userData.id === item.userId) {
										item.user = userData;
									}
									if (userData.id === item.riderId) {
										item.rider = userData;
									}
									if (userData.id === item.restaurant.userId) {
										item.restaurantUser = userData;
									}
								});
								return item;
							});

							if (type === "active") {
								data.activeOrders = newOrderData;
							} else {
								data.pastOrders = newOrderData;
							}

							return res.send({
								data: data,
							});
						}
					);

				} else {
					return res.send({
						data: data,
					});
				}
			})
			.catch((err) => {
				console.log(err);
				return res.status(500).send({
					message: "Internal Server Error.",
				});
			});
	}
};

exports.getActiveOrder = async function (req, res) {
	let userId = req.user.id;
	OrderStatus.findAll({
		where: { deleteStatus: false },
		include: [
			{
				model: DashboardCard,
			},
		],
		order: [["sortOrder", "ASC"]],
	})
		.then((data) => {
			let excludeOrderIds = [];
			data.map((item) => {
				if (
					item.slug === "completed" ||
					item.slug === "pickedUp" ||
					item.slug === "cancelled" ||
					item.slug === "pending"
				) {
					excludeOrderIds.push(item.id);
				}
			});
			console.log(excludeOrderIds);
			let orderStatuses = [];
			Order.findOne({
				where: {
					userId,
					orderStatus: { [Op.notIn]: excludeOrderIds },
				},
				include: [
					{
						model: OrderStatus,
					},
					{
						model: Restaurant,
						attributes: { exclude: ["createdAt", "updatedAt"] },
					},
				],
				attributes: {
					include: [
						[
							sequelize.fn(
								"CONVERT_TZ",
								sequelize.col("orders.createdAt"),
								"+00:00",
								"+05:00"
							),
							"createdAt",
						],
						[
							sequelize.fn(
								"CONVERT_TZ",
								sequelize.col("orders.updatedAt"),
								"+00:00",
								"+05:00"
							),
							"updatedAt",
						],
					],
				},
			})
				.then(async (orderData) => {
					if (orderData) {
						let dashboardCardId = orderData.orderSummary.dashboardCardId;
						orderData = orderData.toJSON();

						let userIds = [];
						userIds.push(orderData.userId);
						if (orderData.acceptedByRider && orderData.riderId) {
							userIds.push(orderData.riderId);
						}
						userIds.push(orderData.restaurant.userId);

						rpcClient.UserService.GetUsers(
							{ ids: userIds },
							async function (err, response) {
								if (err) {
									console.log(err);
									return res.status(500).send({
										message: "Unable to get rider this time.",
									});
								}

								if (!response || !response.data) {
									sequelizeTransaction.rollback();
									return res.status(500).send({
										message: "Unable to get riders this time.",
									});
								}
								let users = JSON.parse(response.data);
								for (let index = 0; index < users.length; index++) {
									let userData = users[index];
									let role = userData?.roles ? userData.roles[0] : null
									let parentId = userData.parentId

									delete userData.roles
									delete userData.parentId
									delete userData.bank_account

									if (role?.roleName === 'user') {
										orderData.user = userData
									}
									if (role?.roleName === 'rider') {

										userData.isRestaurantRider = false
										if (parentId) {
											userData.isRestaurantRider = true
										}

										if (orderData.order_status.slug == 'picked') {
											const getRiderLocation = () => {
												return new Promise((resolve, reject) => {
													try {
														rpcClient.riderRPC.GetRiderLocation({ riderIds: [userData.id] },
															function (error, rpcResponseData) {
																if (error) return reject(error)
																return resolve(rpcResponseData)
															})
													} catch (error) {
														console.log(error);
														return reject(error)
													}
												})
											}

											let riderLocationData = await getRiderLocation()
											console.log(riderLocationData)
											let riderLocations = JSON.parse(riderLocationData.data)
											userData.riderLocation = riderLocations[0]
										}
										orderData.riderDetails = userData
									}
									if (role?.roleName === 'restaurant') {
										orderData.restaurantUser = userData
									}
								}

								// if (orderData.riderId) {
								// 	try {
								// 		let riderData = await axios.get(
								// 			MAIN_SERVICE_URL +
								// 			"/internal/user?list=[" +
								// 			orderData.riderId +
								// 			"]",
								// 			{
								// 				auth: {
								// 					username: BASIC_AUTH_USER,
								// 					password: BASIC_AUTH_PASSWORD,
								// 				},
								// 			}
								// 		);
								// 		if (riderData && riderData.data) {
								// 			let userRecords = riderData.data.data ? riderData.data.data : [];
								// 			orderData.riderDetails = userRecords.find(
								// 				(item) => item.id === orderData.riderId
								// 			);
								// 		} else {
								// 			return res.status(500).send({
								// 				message: "Internal Server Error.",
								// 			});
								// 		}
								// 	} catch (error) {
								// 		console.log(error);
								// 		return res.status(500).send({
								// 			message: "Internal Server Error.",
								// 		});
								// 	}
								// }

								data.map((item) => {
									let orderStatus = item.toJSON();
									if (item.id == orderData.orderStatus) {
										orderStatus.isActive = true;
									} else {
										orderStatus.isActive = false;
									}
									orderStatus.dashboard_cards.map((item) => {
										if (dashboardCardId === item.id) {
											delete orderStatus.dashboard_cards;
											orderStatuses.push(orderStatus);
										}
									});
								});
								console.log(orderStatuses.length);
								orderData.orderStatuses = orderStatuses;
								orderData.deliveryTime = "30-50 mins";
								delete orderData.riderId;
								return res.send({
									data: orderData,
								});
							}
						);

					} else {
						return res.status(200).send({
							message: "Unable to find order data",
							data: {}
						});
					}
				})
				.catch((err) => {
					console.log(err);
					return res.status(500).send({
						message: "Internal Server Error.",
					});
				});
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).send({
				message: "Internal Server Error.",
			});
		});
};

exports.updateOrderStatus = async function (req, res) {
	try {
		const agentRoles = await general_helper.getAgentRoles();

		if (req.user.roleName != 'admin' && !agentRoles.includes(req.user.roleName)) {
			return respondWithError(req, res, 'invalid request', null, 405);
		}

		let order = await Order.findOne({
			where: {
				id: req.body.orderId,
				orderStatus: req.body.orderStatusId,
			},
		})
		if (order) {
			return respondWithError(req, res, 'order has already same status as you want', null, 400);
		}

		order = await Order.findOne({
			where: {
				id: req.body.orderId,
			},
			attributes: ['id', 'orderId', 'userId', 'riderId', 'orderStatus'],
			include: [
				{
					model: OrderStatus,
					attributes: ['id', 'name', 'slug'],
					include: [
						{
							model: DashboardCard,
							through: { attributes: [] },
							where: {
								deleteStatus: false,
								[Op.not]: [
									{
										slug: 'dine-in',
									}
								]
							},
							attributes: ['id', 'name', 'slug'],
							required: true,
						},
					]
				},
			]
		})
		if (!order) {
			return respondWithError(req, res, 'order not found', null, 400);
		}

		let orderStatus = await OrderStatus.findOne({
			where: {
				id: req.body.orderStatusId,
				deleteStatus: false,
				[Op.not]: [
					{
						slug: 'pending',
					}
				]
			},
			attributes: ['id', 'name', 'slug'],
			include: [
				{
					model: DashboardCard,
					through: { attributes: [] },
					where: {
						deleteStatus: false,
						[Op.not]: [
							{
								slug: 'dine-in',
							}
						]
					},
					attributes: ['id', 'name', 'slug'],
					required: true,
				},
			]
		})
		if (!orderStatus) {
			return respondWithError(req, res, 'order status not found', null, 400);
		}

		let supportRelatedReason = await SupportRelatedReason.findOne({
			where: {
				id: req.body.reasonId,
				type: 'orderStatus',
				deleteStatus: false,
			},
			attributes: ['id', 'name', 'type', 'supportTicketRequired', 'roleId', 'orderStatusId', 'departmentId'],
			include: [
				{
					model: OrderStatus,
					where: {
						id: req.body.orderStatusId,
					},
					attributes: ['id'],
					required: true,
				},
			]
		})
		if (!supportRelatedReason) {
			return respondWithError(req, res, 'reason not found', null, 400);
		}

		let ticketId = ''
		if (supportRelatedReason.supportTicketRequired) {
			let objData = {
				email: req.user.email,
				subject: `Update Order Status against orderNo ${order.orderId}`,
				message: supportRelatedReason.name,
			}
			if (supportRelatedReason.departmentId) {
				objData.departmentId = supportRelatedReason.departmentId
			}
			const createTicket = (data) => {
				return new Promise((resolve, reject) => {
					try {
						rpcClient.MainService.CreateTicket({ data: JSON.stringify(data) }, function (error, responseData) {
							if (error) return reject(error)
							return resolve(responseData)
						});
					} catch (error) {
						return reject(error)
					}

				})
			}

			try {
				let responseData = await createTicket(objData)
				console.log(responseData)
				ticketId = responseData?.ticketId
			} catch (error) {
				console.log(error)
				return respondWithError(req, res, 'ticket cannot be created', null, 400);
			}
		}

		const createActionHistory = (userId, action, actionData, ticketId) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient.MainService.CreateActionHistory({
						userId: userId,
						action: action,
						actionData: JSON.stringify(actionData),
						ticketId: ticketId,
					}, function (error, responseData) {
						if (error) return reject(error)
						return resolve(responseData)
					});
				} catch (error) {
					return reject(error)
				}
			})
		}

		try {
			const action = supportRelatedReason.type
			supportRelatedReason = supportRelatedReason.toJSON()
			delete supportRelatedReason.orderStatusId
			delete supportRelatedReason.type
			delete supportRelatedReason.supportTicketRequired
			delete supportRelatedReason.departmentId
			let actionData = {
				message: `order status updated`,
				orderId: order.id,
				reason: supportRelatedReason,
				previousOrderStatus: order.order_status,
				updatedOrderStatus: orderStatus,
			}
			let responseData = await createActionHistory(req.user.id, action, actionData, ticketId)
			console.log(responseData)
		} catch (error) {
			console.log(error)
			// return respondWithError(req, res, 'order status not changed due to some problem', null, 400);
		}

		rpcHelper.updateOrderStatus(orderStatus.slug, order.id)

		if(orderStatus.slug === 'cancelled'){
			rpcHelper.updateRiderOccupyStatus(false, order.riderId)
		}

		order.orderStatus = orderStatus.id
		order.save()

		return respondWithSuccess(req, res, 'order status updated successfully', null);

	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500);
	}
};

exports.updateConsumerLocation = async function (req, res) {
	try {
		let orderId = req.body.orderId
		let lat = req.body.lat
		let long = req.body.long
		let address = req.body.address
		let reasonId = req.body.reasonId

		const agentRoles = await general_helper.getAgentRoles();

		if (req.user.roleName != 'admin' && !agentRoles.includes(req.user.roleName)) {
			return respondWithError(req, res, 'invalid request', null, 405);
		}

		let order = await Order.findOne({
			where: {
				id: orderId,
				acceptedByRider: true,
			},
			attributes: ['id', 'orderId', 'userId', 'riderId', 'orderStatus', 'orderSummary'],
			include: [
				{
					model: OrderStatus,
					where: {
						slug: 'picked',
					},
					attributes: ['id', 'name', 'slug'],
					required: true,
					include: [
						{
							model: DashboardCard,
							through: { attributes: [] },
							where: {
								deleteStatus: false,
								slug: 'delivery',
							},
							attributes: ['id'],
							required: true,
						},
					]
				}
			]
		})
		if (!order) {
			return respondWithError(req, res, 'order not found', null, 400);
		}

		let supportRelatedReason = await SupportRelatedReason.findOne({
			where: {
				id: reasonId,
				type: 'location',
				deleteStatus: false,
			},
			attributes: ['id', 'name', 'type', 'supportTicketRequired', 'roleId', 'departmentId']
		})
		if (!supportRelatedReason) {
			return respondWithError(req, res, 'reason not found', null, 400);
		}

		let distance = general_helper.getDistanceFromLatLonInKm(Number(lat), Number(long), Number(order.orderSummary.lat), Number(order.orderSummary.long))
		if (distance > 0.5) {
			return respondWithError(req, res, 'please put your distance under 0.5 Mile circle', null, 400);
		}

		const UpdateConsumerDeliveryAddress = (orderId, lat, long, address) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient.riderRPC.UpdateConsumerDeliveryAddress({
						orderId: orderId,
						lat: lat,
						long: long,
						address: address,
					}, function (error, responseData) {
						if (error) return reject(error)
						return resolve(responseData)
					});
				} catch (error) {
					return reject(error)
				}
			})
		}

		try {
			let responseData = await UpdateConsumerDeliveryAddress(order.id, lat, long, address)
			console.log(responseData)
			if (responseData.status == false) {
				return respondWithError(req, res, 'address cannot be update', null, 400);
			}
		} catch (error) {
			console.log(error)
			return respondWithError(req, res, 'address cannot be update', null, 400);
		}

		let ticketId = ''
		if (supportRelatedReason.supportTicketRequired) {
			let objData = {
				email: req.user.email,
				subject: `Update consumer delivery address against orderNo ${order.orderId}`,
				message: supportRelatedReason.name,
			}
			if (supportRelatedReason.departmentId) {
				objData.departmentId = supportRelatedReason.departmentId
			}
			const createTicket = (data) => {
				return new Promise((resolve, reject) => {
					try {
						rpcClient.MainService.CreateTicket({ data: JSON.stringify(data) }, function (error, responseData) {
							if (error) return reject(error)
							return resolve(responseData)
						});
					} catch (error) {
						return reject(error)
					}
				})
			}

			try {
				let responseData = await createTicket(objData)
				console.log(responseData)
				ticketId = responseData?.ticketId
			} catch (error) {
				console.log(error)
				return respondWithError(req, res, 'ticket cannot be created', null, 400);
			}
		}

		const createActionHistory = (userId, action, actionData, ticketId) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient.MainService.CreateActionHistory({
						userId: userId,
						action: action,
						actionData: JSON.stringify(actionData),
						ticketId: ticketId,
					}, function (error, responseData) {
						if (error) return reject(error)
						return resolve(responseData)
					});
				} catch (error) {
					return reject(error)
				}
			})
		}

		try {
			const action = supportRelatedReason.type
			supportRelatedReason = supportRelatedReason.toJSON()
			delete supportRelatedReason.type
			delete supportRelatedReason.supportTicketRequired
			delete supportRelatedReason.departmentId
			let actionData = {
				message: `consumer delivery address updated`,
				orderId: order.id,
				reason: supportRelatedReason,
				previousData: {
					lat: order.orderSummary.lat,
					long: order.orderSummary.long,
					deliveryAddress: order.orderSummary.deliveryAddress,
				},
				updatedData: {
					lat: lat,
					long: long,
					deliveryAddress: address,
				},
			}
			let responseData = await createActionHistory(req.user.id, action, actionData, ticketId)
			console.log(responseData)
		} catch (error) {
			console.log(error)
			// return respondWithError(req, res, 'order status not changed due to some problem', null, 400);
		}

		let orderSummary = order.orderSummary
		orderSummary.lat = lat
		orderSummary.long = long
		orderSummary.deliveryAddress = address
		await order.update({ orderSummary: JSON.stringify(orderSummary) });

		//Consumer Notification
		let notificationData = {
			userId: order.userId,
			title: "Order Update",
			body: `Your delivery address has been updated`,
			data: {
				action: `address_update`,
				data: { id: order.id },
			},
		};
		general_helper.sendNotification(notificationData);

		//Rider Notification
		notificationData.body = `User delivery address has been updated`
		notificationData.userId = order.riderId
		general_helper.sendNotification(notificationData);

		return respondWithSuccess(req, res, 'address updated successfully', null);

	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500);
	}
};

exports.updateOrderDeliveryTime = async function (req, res) {
	try {
		const agentRoles = await general_helper.getAgentRoles();

		if (req.user.roleName != 'admin' && !agentRoles.includes(req.user.roleName)) {
			return respondWithError(req, res, 'invalid request', null, 405);
		}

		let orderId = req.body.orderId
		let extraTime = req.body.extraTime
		let reasonId = req.body.reasonId

		let order = await Order.findOne({
			where: {
				id: orderId,
			},
			attributes: ['id', 'orderId', 'userId', 'riderId', 'orderStatus', 'restaurantDeliveryTime'],
			include: [
				{
					model: OrderStatus,
					where: {
						slug: 'picked'
					},
					attributes: []
				}
			]
		})
		if (!order) {
			return respondWithError(req, res, 'order not found', null, 400);
		}
		let updatedRestaurantDeliveryTime = moment(order.restaurantDeliveryTime).add(extraTime, 'minutes').format(appConstants.TIMESTAMP_FORMAT)

		let supportRelatedReason = await SupportRelatedReason.findOne({
			where: {
				id: reasonId,
				type: 'orderDeliveryTime',
				deleteStatus: false,
			},
			attributes: ['id', 'name', 'type', 'supportTicketRequired', 'roleId', 'departmentId']
		})
		if (!supportRelatedReason) {
			return respondWithError(req, res, 'reason not found', null, 400);
		}

		let ticketId = ''
		if (supportRelatedReason.supportTicketRequired) {
			let objData = {
				email: req.user.email,
				subject: `Update delivery time against orderNo ${order.orderId}`,
				message: supportRelatedReason.name,
			}
			if (supportRelatedReason.departmentId) {
				objData.departmentId = supportRelatedReason.departmentId
			}
			const createTicket = (data) => {
				return new Promise((resolve, reject) => {
					try {
						rpcClient.MainService.CreateTicket({ data: JSON.stringify(data) }, function (error, responseData) {
							if (error) return reject(error)
							return resolve(responseData)
						});
					} catch (error) {
						return reject(error)
					}
				})
			}

			try {
				let responseData = await createTicket(objData)
				console.log(responseData)
				ticketId = responseData?.ticketId
			} catch (error) {
				console.log(error)
				return respondWithError(req, res, 'ticket cannot be created', null, 400);
			}
		}

		const createActionHistory = (userId, action, actionData, ticketId) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient.MainService.CreateActionHistory({
						userId: userId,
						action: action,
						actionData: JSON.stringify(actionData),
						ticketId: ticketId,
					}, function (error, responseData) {
						if (error) return reject(error)
						return resolve(responseData)
					});
				} catch (error) {
					return reject(error)
				}
			})
		}

		try {
			const action = supportRelatedReason.type
			supportRelatedReason = supportRelatedReason.toJSON()
			delete supportRelatedReason.type
			delete supportRelatedReason.supportTicketRequired
			delete supportRelatedReason.departmentId
			let actionData = {
				message: `order delivery time updated`,
				orderId: order.id,
				reason: supportRelatedReason,
				increasedOrderDuration: `${extraTime} Minutes`,
				previousData: {
					restaurantDeliveryTime: order.restaurantDeliveryTime
				},
				updatedData: {
					restaurantDeliveryTime: updatedRestaurantDeliveryTime
				},
			}
			let responseData = await createActionHistory(req.user.id, action, actionData, ticketId)
			console.log(responseData)
		} catch (error) {
			console.log(error)
			// return respondWithError(req, res, 'order status not changed due to some problem', null, 400);
		}

		Order.update({ restaurantDeliveryTime: updatedRestaurantDeliveryTime }, { where: { id: order.id } })

		//Consumer Notification
		let notificationData = {
			userId: order.userId,
			title: "Order Update",
			body: `Your delivery time has been updated`,
			data: {
				action: `delivery_time_update`,
				data: { id: order.id },
			},
		};
		general_helper.sendNotification(notificationData);

		//Rider Notification
		notificationData.body = `User delivery time has been updated`
		notificationData.userId = order.riderId
		general_helper.sendNotification(notificationData);

		return respondWithSuccess(req, res, 'delivery time updated successfully', null);

	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500);
	}
};

exports.getOne = async function (req, res) {
	let userId = req.user.id;
	let id = req.params.id;

	let whereClause = { userId: userId }

	let agentRoles = await general_helper.getAgentRoles();
	if (req.user.roleName === "admin" || agentRoles.includes(req.user.roleName)) {
		delete whereClause.userId
	}

	Order.findOne({
		where: {
			...whereClause,
			[Op.or]: [
				{
					id: id,
				},
				{
					orderId: `#${id}`,
				},
			],
		},
		include: [
			{ model: Restaurant },
			{ model: OrderStatus },
			{
				model: Review,
				where: {
					type: 'order'
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
						sequelize.col("orders.createdAt"),
						"+00:00",
						"+05:00"
					),
					"createdAt",
				],
				[
					sequelize.fn(
						"CONVERT_TZ",
						sequelize.col("orders.updatedAt"),
						"+00:00",
						"+05:00"
					),
					"updatedAt",
				],
			],
		},
	}).then(async (orderData) => {
		if (orderData) {
			orderData = orderData.toJSON();

			let userIds = [];
			userIds.push(orderData.userId);
			if (orderData.acceptedByRider && orderData.riderId) {
				userIds.push(orderData.riderId);
			}
			userIds.push(orderData.restaurant.userId);

			rpcClient.UserService.GetUsers(
				{ ids: userIds },
				async function (err, response) {
					if (err) {
						console.log(err);
						return res.status(500).send({
							message: "Unable to get rider this time.",
						});
					}

					if (!response || !response.data) {
						sequelizeTransaction.rollback();
						return res.status(500).send({
							message: "Unable to get riders this time.",
						});
					}
					let users = JSON.parse(response.data);
					users.forEach(async (userData) => {
						let role = userData?.roles ? userData.roles[0] : null
						let parentId = userData.parentId

						delete userData.roles
						delete userData.parentId
						delete userData.bank_account

						if (role?.roleName === 'user') {
							orderData.user = userData
						}
						if (role?.roleName === 'rider') {

							userData.isRestaurantRider = false
							if (parentId) {
								userData.isRestaurantRider = true
							}

							if (orderData.order_status.slug == 'picked') {
								const getRiderLocation = () => {
									return new Promise((resolve, reject) => {
										try {
											rpcClient.riderRPC.GetRiderLocation({ riderIds: [userData.id] },
												function (error, rpcResponseData) {
													if (error) return reject(error)
													return resolve(rpcResponseData)
												})
										} catch (error) {
											console.log(error);
											return reject(error)
										}
									})
								}

								let riderLocationData = await getRiderLocation()
								let riderLocations = JSON.parse(riderLocationData.data)
								userData.riderLocation = riderLocations[0]
							}

							orderData.riderDetails = userData
						}
						if (role?.roleName === 'restaurant') {
							orderData.restaurantUser = userData
						}
					})

					let dashboardCardId = orderData.orderSummary.dashboardCardId;
					let dashboardCardData = await DashboardCard.findOne({
						where: { id: dashboardCardId },
					});
					// if (orderData.riderId) {
					// 	try {
					// 		let riderData = await axios.get(
					// 			MAIN_SERVICE_URL +
					// 			"/internal/user?list=[" +
					// 			orderData.riderId +
					// 			"]",
					// 			{
					// 				auth: {
					// 					username: BASIC_AUTH_USER,
					// 					password: BASIC_AUTH_PASSWORD,
					// 				},
					// 			}
					// 		);
					// 		console.log('riderData=>', riderData)

					// 		if (riderData && riderData.data) {
					// 			let userRecords = riderData.data.data ? riderData.data.data : [];
					// 			orderData.riderDetails = userRecords.find(
					// 				(item) => item.id === orderData.riderId
					// 			);
					// 		} else {
					// 			return res.status(500).send({
					// 				message: "Internal Server Error.",
					// 			});
					// 		}
					// 	} catch (error) {
					// 		// console.log(error);
					// 		return res.status(500).send({
					// 			message: "Internal Server Error.",
					// 		});
					// 	}
					// }

					let slugNotIn = ["pending", "cancelled"];
					if (dashboardCardData.slug === "pick-up") {
						slugNotIn.push("completed");
					}

					OrderStatus.findAll({
						where: { deleteStatus: false, slug: { [Op.notIn]: slugNotIn } },
						include: [
							{
								model: DashboardCard,
							},
						],
						order: [["sortOrder", "ASC"]],
					}).then(async (data) => {
						// console.log(data);
						let orderStatuses = [];
						data.map((item) => {
							let orderStatus = item.toJSON();
							if (item.id == orderData.orderStatus) {
								orderStatus.isActive = true;
							} else {
								orderStatus.isActive = false;
							}
							orderStatus.dashboard_cards.map((item) => {
								if (dashboardCardId === item.id) {
									delete orderStatus.dashboard_cards;
									orderStatuses.push(orderStatus);
								}
							});
							// orderStatuses.push(orderStatus)
						});

						let deliveryTime = "30-50 Minutes";

						// if (dashboardCardData.slug === "pick-up") {
						//   deliveryTime = moment(orderData.createdAt).format(
						//     "YYYY-MM-DD hh:mm A"
						//   );
						// }

						let orderHistory = await OrderHistory.findAll({
							where: {
								orderId: id
							}
						})

						orderData.orderHistory = orderHistory
						orderData.deliveryTime = deliveryTime;
						orderData.orderStatuses = orderStatuses;
						delete orderData.riderId;
						return res.send({
							data: orderData,
						});
					}).catch((err) => {
						console.log(err);
						return res.status(500).send({
							message: "Internal Server Error.",
						});
					});
				}
			);

		} else {
			return res.status(400).send({
				message: "Unable to find order data",
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

exports.getAcceptanceAndCancellationRate = async function (req, res) {
	let userId = req.user.id;
	let restaurantId = req.query.restaurantId;
	let dataRequiredOfDays = req.body.days ? Number(req.body.days) : 30
	// console.log('restaurantID =>', req.query.restaurantId);
	// console.log('req.query =>', req.query);

	//Api mey past days update hnday hyn according tu super admin (Remaining Work)

	let date = moment().subtract(dataRequiredOfDays, 'days').format('YYYY-MM-DD')
	// console.log('date =>', date);
	Order.findAll({
		attributes: ['id'],
		where: {
			createdAt: {
				[Op.gte]: date
			}
		},
		include: [
			{
				model: Restaurant,
				attributes: ['id'],
				where: {
					id: restaurantId
				}
			},
			{
				model: OrderStatus,
			},
		],
	}).then(async (orderData) => {
		// console.log('orderData =>', orderData);
		if (orderData) {

			try {
				let cancellationRate = 0
				let acceptanceRate = 100

				let cancelledOrder = orderData.filter(item => item.order_status.slug == 'Cancelled' || item.order_status.slug == 'cancelled')
				// console.log('cancelledOrder =>', cancelledOrder.length);

				if (cancelledOrder.length) {

					cancellationRate = ((cancelledOrder.length / orderData.length) * 100).toFixed(2)

					acceptanceRate = (100 - cancellationRate).toFixed(2)
				}

				res.status(200).send({
					data: { cancellationRate, acceptanceRate }
				})
			} catch (error) {
				console.log(error);
			}


		} else {
			return res.status(400).send({
				message: "Unable to find order data",
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

exports.post = async function (req, res) {
	const sequelizeTransaction = await sequelize_conn.transaction();
	try {
		// console.log("User Place Order Body", req.body)
		let user = req.user;
		let userId = user.id;
		let geoLocation = null;
		let parseData = general_helper.IsValidJSONString(req.headers['geolocation'])
		if (parseData) {
			geoLocation = parseData
		}
		let cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long);

		let deliveryInstructions = req.body.deliveryInstructions;
		let paymentMethodId = req.body.paymentMethodId;
		let deliveryAddress = req.body.deliveryAddress;
		let lat = req.body.lat;
		let long = req.body.long;
		let riderId = null
		if (cartData && Object.keys(cartData).length) {
			// if (cartData.unavailableItems.length) {
			// 	sequelizeTransaction.rollback();
			// 	return res.status(400).send({
			// 		message:
			// 			"Some of items are not available anymore from cart. Please update your cart.",
			// 		data: cartData.unavailableItems,
			// 	});
			// }
			if (
				cartData.dashboard_card.slug !== "delivery" &&
				cartData.dashboard_card.slug !== "pick-up"
			) {
				return res.status(400).send({ message: "Unauthorized Access." });
			}

			let productNotAvailIds = []
			cartData.unavailableItems.forEach(element => {
				if (element.productNotAvailableValueId) {
					productNotAvailIds.push(element.productNotAvailableValueId)
				}
			});

			let productNotAvailValuesData = await ProductNotAvailable.findAll({
				where: {
					id: {
						[Op.in]: productNotAvailIds
					}
				}
			})

			let canCancelWholeOrderData = productNotAvailValuesData.find(a => a.slug == 'cancel_the_whole_order')
			if (canCancelWholeOrderData) {
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
				sequelizeTransaction.commit();
				return res.status(400).send({ message: "Order has been cancelled due to unavailability of product" });
			}

			let cartProducts = cartData.cart_products
			let priceNeedToSubtract = 0;
			cartData.unavailableItems.forEach(element => {
				let productNotAvailable = productNotAvailValuesData.find(a => a.id == element.productNotAvailableValueId)
				if (productNotAvailable?.slug == 'remove_the_item_from_my_order') {
					let index = cartProducts.findIndex(a => a.id == element.id)
					if (index > -1) {
						priceNeedToSubtract += Number(cartProducts[index].productData.price)
						cartProducts.splice(index, 1)
					}
				}
			});
			if (!cartProducts || !cartProducts.length) {
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
				sequelizeTransaction.commit();
				return res.status(400).send({ message: "Order has been cancelled due to empty cart" });
			}

			if (cartProducts && cartProducts.length < cartData.cart_products.length) {
				cartData.cart_products = cartProducts
				cartData.subTotal = Number(cartData.subTotal) - priceNeedToSubtract
				cartData.total = Number(cartData.total) - priceNeedToSubtract
			}

			if (Number(cartData.subTotal) < Number(cartData.restaurant.minDeliveryOrderPrice)) {
				return res.status(400).send({ message: `Your order price should be equal or greater than ${cartData.restaurant.minDeliveryOrderPrice}` });
			}

			if (cartData.promoCode) {
				let isPromoAvailable = await new Promise((resolve, reject) => {
					rpcClient.BillingService.CheckPromoAvailability(
						{
							userId: userId,
							promoCode: cartData.promoCode,
						},
						async (error, respPromoCode) => {
							if (error) {
								console.log(error);
								resolve({
									status: false,
									message: "Error:Internal Server Error.",
								});
							}
							try {
								console.log(respPromoCode);
								let data = respPromoCode;
								if (!data) {
									resolve({
										status: false,
										message: "Error:Internal Server Error.",
									});
								} else {
									if (data.status) {
										resolve({
											status: true,
										});
									} else {
										resolve({
											status: false,
											message: data.message,
										});
									}
								}
							} catch (error) {
								resolve(false);
							}
						}
					);
				});
				if (!isPromoAvailable.status) {
					sequelizeTransaction.rollback();
					return res.status(400).send({
						message: isPromoAvailable.message,
					});
				}
			}

			rpcClient.BillingService.GetPaymentMethods(
				{
					id: paymentMethodId,
				},
				async (error, respPaymentMethods) => {
					if (error) {
						console.log(error);
						sequelizeTransaction.rollback();
						return res.status(500).send({
							status: false,
							message: "Error: Internal server error",
						});
					}
					try {
						let paymentMethodData = JSON.parse(respPaymentMethods.data);
						if (!paymentMethodData) {
							sequelizeTransaction.rollback();
							return res.status(400).send({
								message: "Error: Unable to find payment method.",
							});
						}

						if (paymentMethodData.slug === 'cash_payment' && (req.body.isContactLessDelivery == true || req.body.isContactLessDelivery == '1')) {
							sequelizeTransaction.rollback();
							return res.status(400).send({
								message: "Error: Cannot select cash on delivery and contact less delivery at same time.",
							});
						}

						let restricted = cartData.cart_products.find(a => a.productData?.ageRestrictedItem == 'true' || a.productData?.ageRestrictedItem == true)
						if (restricted && (req.body.isContactLessDelivery == true || req.body.isContactLessDelivery == '1')) {
							if (!ageRestrictedPhotoId) {
								return res.status(400).send({
									message: "Error: Cannot select contact less delivery and age restricted item at same time.",
								});
							}
						}

						try {
							let cardDataJson = cartData;

							let userSettingsData = await UserSetting.findOne({ where: { userId: userId, slug: 'allow_my_rider', status: true } })

							if (
								cardDataJson.restaurant.branchOwnRiders
								&& !cardDataJson.restaurant.branchOwnRidersCod
								&& !userSettingsData
							) {
								sequelizeTransaction.rollback();
								return res.status(400).send({
									message: "Error: Cannot select cash on delivery.",
									redirectToCart: true
								});
							}

							cardDataJson.deliveryInstructions = deliveryInstructions;
							// here is problem;
							cardDataJson.paymentMethod = {
								id: paymentMethodData.id,
								name: paymentMethodData.name,
								slug: paymentMethodData.slug,
							};

							cardDataJson.deliveryAddress = deliveryAddress;
							cardDataJson.lat = lat;
							cardDataJson.long = long;

							let restaurantId = cardDataJson.restaurant.id;
							let dashboardCardId = cardDataJson.dashboardCardId;
							let restaurantUserId = cardDataJson.restaurant.userId;
							let restaurantData = cardDataJson.restaurant
							delete cardDataJson.restaurant;

							// let data = await OrderStatus.findAll({
							//     where: { deleteStatus: false }
							// })
							let orderStatuses = await OrderStatus.findAll(
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

							orderStatuses.map((orderStatus) => {
								// console.log(orderStatus)
								if (orderStatus.slug === "pending") {
									pendingOrderStatus = orderStatus;
								} else if (orderStatus.slug === "confirmed") {
									confirmedOrderStatus = orderStatus;
								}
							});

							if (!pendingOrderStatus || !confirmedOrderStatus) {
								sequelizeTransaction.rollback();
								// if (riderId) {
								// 	rpcHelper.updateRiderOccupyStatus(false, riderId)
								// }
								return res.status(400).send({
									message: "Error: Unable to find order status.",
								});
							}

							let order = new Order({
								userId: req.user.id,
								orderId: "",
								orderSummary: JSON.stringify(cardDataJson),
								orderStatus: pendingOrderStatus.id,
								restaurantId: restaurantId,
								dashboardCardId: dashboardCardId,
								riderId: riderId,
							});

							if (req.body.isContactLessDelivery == false || req.body.isContactLessDelivery) {
								order.isContactLessDelivery = req.body.isContactLessDelivery
							}

							await order.save({ transaction: sequelizeTransaction });
							if (paymentMethodData.slug !== "paypal") {
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

							let paymentData = req.body.paymentData;
							console.log("paymentMethodData.slug : ", paymentData)
							rpcClient.BillingService.ServiceTransaction(
								{
									user: JSON.stringify(req.user),
									amount: cartData.total,
									paymentMethodSlug: paymentMethodData.slug,
									orderId: order.id,
									paymentData: JSON.stringify(paymentData),
									type: "order",
								}, async (err, respTransactionData) => {
									if (err) {
										console.log(err.message);
										sequelizeTransaction.rollback();
										// if (riderId) {
										// 	rpcHelper.updateRiderOccupyStatus(false, riderId)
										// }
										return res.status(500).send({
											message: `Error: ${err.message}`,
										});
									}

									if (!respTransactionData || !respTransactionData.data) {
										sequelizeTransaction.rollback();
										// if (riderId) {
										// 	rpcHelper.updateRiderOccupyStatus(false, riderId)
										// }
										return res.status(500).send({
											message: "Error! transaction could not be processed",
										});
									}

									try {
										let transactionData = JSON.parse(
											respTransactionData.data
										);

										// this should be here;
										if (transactionData?.completedBySplitPayment) {
											cardDataJson.paymentMethod = {
												id: transactionData?.splitPaymentMethod?.id,
												name: transactionData?.splitPaymentMethod?.name,
												slug: transactionData?.splitPaymentMethod?.slug,
											};
											order.orderSummary = JSON.stringify(cardDataJson)
											await order.save({ transaction: sequelizeTransaction });
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

										if (transactionData.pendingAmount > 0 && !transactionData.instantPayment && paymentMethodData.slug !== "cash_payment") {
											console.log("transactionData:", transactionData);
											sequelizeTransaction.commit();
											return res.send({
												status: true,
												data: transactionData.paymentResponse,
											});
										}

										order.orderStatus = confirmedOrderStatus.id;
										await order.save({
											transaction: sequelizeTransaction,
										});

										let orderDataJson = order.toJSON();

										sequelizeTransaction.commit();

										let orderStatusesJson = [];

										orderStatuses.map((item) => {
											let orderStatus = item.toJSON();
											if (orderStatus.id == orderDataJson.orderStatus) {
												orderStatus.isActive = true;
											} else {
												orderStatus.isActive = false;
											}
											orderStatusesJson.push(orderStatus);
										});

										orderDataJson.orderStatuses = orderStatusesJson;
										orderDataJson.orderSummary = JSON.parse(
											order.orderSummary
										);

										let notificationData = {
											userId: restaurantUserId,
											title: "New Order Request",
											body: "New Order has been received. Click to check.",
											data: {
												action: "new_order",
												data: { id: orderDataJson.id },
											},
										};

										general_helper.sendNotification(notificationData);
										let emailData = {
											username: user.fullName ? user.fullName : user.username ? user.username : user.email,
											restaurantName: restaurantData.name,
											deliveryTime: '30 - 40 Minutes',
											orderNo: orderDataJson.orderId,
											orderDate: moment(orderDataJson.createdAt).format("YYYY-MM-DD hh:mm"),
											deliveryAddress: deliveryAddress,
											products: orderDataJson.orderSummary.cart_products,
											subTotal: parseFloat(orderDataJson.orderSummary.subTotal).toFixed(2),
											deliveryCharges: parseFloat(orderDataJson.orderSummary.deliveryCharges).toFixed(2),
											total: parseFloat(orderDataJson.orderSummary.total).toFixed(2),
											vat: parseFloat(orderDataJson.orderSummary.vat).toFixed(2),
											currencySymbol: '£',

										}

										// console.log(emailData.products)

										rpcClient.MainService.SendEmail({
											subject: 'Order Has been placed successfully.',
											to: user.email,
											template: 'user/invoice.pug',
											templateData: JSON.stringify(emailData)
										}, function (error, sendEmailResponse) {
											console.log('email error', error, sendEmailResponse)
										})
										// console.log(orderDataJson)
										return res.send({
											message: "Order has been placed successfully.",
											data: orderDataJson,
										});
									} catch (error) {
										console.log(error);
										sequelizeTransaction.rollback();
										// if (riderId) {
										// 	rpcHelper.updateRiderOccupyStatus(false, riderId)
										// }
										return res.status(500).send({
											status: false,
											message: "Error! Internal server error",
										});
									}
								}
							);
						} catch (error) {
							console.log(error);
							// if (riderId) {
							// 	rpcHelper.updateRiderOccupyStatus(false, riderId)
							// }
							sequelizeTransaction.rollback();
							return res.status(500).send({
								message: "Error: Internal Server Error.",
							});
						}
						return;
					} catch (error) {
						// if (riderId) {
						// 	rpcHelper.updateRiderOccupyStatus(false, riderId)
						// }
						console.log(error);
						sequelizeTransaction.rollback();
						return res.status(500).send({
							status: false,
							message: "Error: Internal server error",
						});
					}
				}
			);
			return;
		} else {
			// if (riderId) {
			// 	rpcHelper.updateRiderOccupyStatus(false, riderId)
			// }
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

exports.put = async function (req, res) {
	let userId = req.user.id;
	let orderId = req.body.orderId;
	let restaurantId = req.body.restaurantId;
	let orderStatusSlug = req.body.orderStatusSlug;

	//CHECK IF USER OWNS THIS RESTAURANT
	OrderStatus.findOne({
		where: {
			slug: orderStatusSlug,
		},
	})
		.then((item) => {
			if (item && (item.slug === 'picked' || item.slug === 'cancelled')) {
				Order.findOne({
					where: {
						restaurantId: restaurantId,
						id: orderId,
						userId: userId
					},
					include: [
						{
							model: Restaurant,
							attributes: ['userId'],
							required: true
						},
						{
							model: OrderStatus,
							where: {
								slug: {
									[Op.ne]: "cancelled"
								}
							},
							required: true
						}
					]
				})
					.then(async (orderData) => {
						if (orderData) {
							let historyObject = {
								orderId: orderData.id,
								action: 'cancelled_by_consumer'
							};
							await general_helper.saveOrderHistory(historyObject);

							let restaurantNotificationData = {
								userId: orderData.restaurant.userId,
								title: "Order Cancel",
								body: `Order has been cancelled by user.`,
								data: {
									action: "order cancel",
									data: { id: orderData.id },
								},
							};
							general_helper.sendNotification(restaurantNotificationData);

							orderData.orderStatus = item.id;


							if (item.slug === 'cancelled' && orderData.order_status && orderData.order_status.slug == 'confirmed'
								&& orderData.orderSummary
								&& orderData.orderSummary.paymentMethod
								&& (REFUNDABLE_PAYMENT_METHODS.includes(orderData.orderSummary.paymentMethod.slug))) {
								let data = {
									amount: orderData.orderSummary.total,
									userId: orderData.userId,
									paymentSummary: { message: "Order cancelled by user. Credits has been added to wallet" },
									orderId: orderData.id
								}
								let isRefunded = await refundToWallet(data)
								console.log(isRefunded)
								if (!isRefunded) {
									return res.status(400).send({
										message: "Unable to find order data",
									});
								}

								orderData.orderSummary = JSON.stringify(orderData.orderSummary)
								await orderData.save();

								orderData = orderData.toJSON()
								orderData.orderSummary = JSON.parse(orderData.orderSummary)

								let updatedData = await Order.findOne({
									where: {
										restaurantId: restaurantId,
										id: orderId,
									},
									include: { model: OrderStatus, required: true }
								})

								return res.send({
									data: updatedData,
								});

							} else {
								orderData.orderSummary = JSON.stringify(orderData.orderSummary)
								await orderData.save();
								orderData = orderData.toJSON()
								orderData.orderSummary = JSON.parse(orderData.orderSummary)

								let updatedData = await Order.findOne({
									where: {
										restaurantId: restaurantId,
										id: orderId,
									},
									include: { model: OrderStatus, required: true }
								})

								return res.send({
									data: updatedData,
								});
							}

						} else {
							return res.status(400).send({
								message: "Error: Unauthorize access",
							});
						}
					})
					.catch((err) => {
						console.log(err);
						return res.status(500).send({
							message: "Internal Server Error.",
						});
					});

			} else {
				return res.status(400).send({
					message: "Error: Unauthorize access",
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

exports.getPendingReviewOrder = async function (req, res) {
	try {

		let userId = req.user.id

		let orders = await Order.findAll({
			where: {
				userId,
				isReviewed: false,
			},
			attributes: ['id', 'orderId', 'restaurantId'],
			order: [['id', 'desc']],
			include: [
				{
					model: OrderStatus,
					where: {
						slug: 'completed'
					},
					attributes: [],
				},
				{
					model: Restaurant,
					attributes: ['name'],
				},
				{
					model: Review,
					where: {
						type: 'order'
					},
					required: false
				}
			]
		})

		let order = orders.find(a => a.review == null)

		// console.log('order=>', order)
		let orderStatus = await OrderStatus.findOne({
			where: {
				slug: 'completed'
			},
			attributes: ['id'],
		})

		Order.update({ isReviewed: true }, {
			where: {
				userId: userId,
				orderStatus: orderStatus.id,
				isReviewed: false,
			}
		})

		if (order) {
			order = order.toJSON()
			order.type = 'order'
			delete order.review
			return respondWithSuccess(req, res, 'order with pending review fetched successfully', order);
		}
		else {
			return respondWithSuccess(req, res, 'order with pending review not found', null);
		}


	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500);
	}
};

// RPC Methods
exports.allOrders = async function (call, callback) {
	let id = call.request.id;
	var items = await Order.findAll({ where: { riderId: id } });
	return callback(null, { orders: items });
};

exports.confirmOrder = async function (call, callback) {
	try {
		let orderStatuses = await OrderStatus.findAll({
			where: { deleteStatus: false },
		});

		let pendingOrderStatus = null;
		let confirmedOrderStatus = null;

		orderStatuses.map((orderStatus) => {
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

		let orderId = call.request.id;
		console.log("OrderId:", orderId);

		let order = await Order.findOne({
			where: {
				id: orderId,
			},
		});

		if (!order) {
			callback({
				status: false,
				message: "Error: Order not found",
			});
		}

		// console.log(order);

		order.orderSummary = JSON.stringify(order.orderSummary);
		order.orderStatus = confirmedOrderStatus.id;
		await order.save();

		let orderDataJson = order.toJSON();

		let orderStatusesJson = [];

		orderStatuses.map((item) => {
			let orderStatus = item.toJSON();
			if (orderStatus.id == orderDataJson.orderStatus) {
				orderStatus.isActive = true;
			} else {
				orderStatus.isActive = false;
			}
			orderStatusesJson.push(orderStatus);
		});

		orderDataJson.orderStatuses = orderStatusesJson;
		orderDataJson.orderSummary = JSON.parse(orderDataJson.orderSummary);

		return callback(null, {
			status: true,
			data: JSON.stringify(orderDataJson),
		});
	} catch (error) {
		console.log(error);
		return callback({
			status: false,
			message: "Error! Internal server error",
		});
	}
};


exports.updateRiderOfOrder = async function (call, callback) {
	console.log(call.request)
	let riderId = call.request.riderId
	let orderId = call.request.orderId

	Order.update({ riderId }, { where: { id: orderId } }).then(data => {
		if (data) {

			let riderNotificationData = {
				userId: riderId,
				title: "New Order",
				body: `You have new order. Click for more details.`,
				data: {
					action: "new_order",
					data: { id: orderId },
				},
			};
			general_helper.sendNotification(riderNotificationData);

			callback(null, { status: true, message: "Order Rider has been updated successfully." })


		} else {
			callback(null, { status: false, message: "Order not found. Unable to update rider." })
		}
	}

	).catch(err => {
		console.log(err)
		callback(null, { status: false, message: "Internal Server error. Unable to update rider." })
	})

};

exports.updateOrderStatusByRIder = async function (call, callback) {
	console.log(call.request)
	let riderId = call.request.riderId
	let orderId = call.request.orderId
	let status = call.request.status
	let extraInfo = call.request.extraInfo
	let image = call.request.image
	if (extraInfo) {
		extraInfo = JSON.parse(extraInfo)
	}
	if (!riderId || !orderId || !status) {
		callback(null, { status: false, message: "Incomplete information. Unable to update status." })
	}

	let orderStatusWhereClause = { slug: status }
	if (status == 'cancelled_by_rider') {
		orderStatusWhereClause.slug = 'cancelled'
	} else if (status == 'cancelled_by_system') {
		orderStatusWhereClause.slug = 'cancelled'
	}

	Order.findOne({
		where: {
			id: orderId,
			riderId: riderId
		}
	}).then(async data => {
		if (data) {
			let orderStatus = await OrderStatus.findOne({ where: orderStatusWhereClause })
			if (orderStatus) {
				let historyObject = {
					orderId: data.id,
					action: status == 'picked' ? 'picked_by_rider' : status == 'completed' ? 'completed_by_rider' : status
				};
				await general_helper.saveOrderHistory(historyObject);

				let orderSummary = data.orderSummary
				if (image && data.isContactLessDelivery) {
					orderSummary.foodImage = image
				}
				else if (image && orderSummary.cart_products.find(a => a.productData?.ageRestrictedItem == 'true' || a.productData?.ageRestrictedItem == true)) {
					orderSummary.ageRestrictedPhotoId = image
				}

				data.update({ orderStatus: orderStatus.id, orderSummary: JSON.stringify({ ...orderSummary }) }).then(async item => {

					let notificationData = {
						userId: data.userId,
						title: "Order update.",
						body: "Order Status has been updated. Click to check.",
						data: {
							action: `order_${orderStatus.slug}`,
							data: { id: data.id },
						},
					};
					if (orderStatus.slug == 'cancelled'
						&& data.orderSummary
						&& data.orderSummary.paymentMethod
						&& (REFUNDABLE_PAYMENT_METHODS.includes(data.orderSummary.paymentMethod.slug))) {
						let refundData = {
							amount: data.orderSummary.total,
							userId: data.userId,
							paymentSummary: { message: `${extraInfo && extraInfo.message ? extraInfo.message : "Order Has been cancelled due to unavailability of riders."} Credits has been added to wallet."` },
							orderId: data.id
						}
						let isRefunded = await refundToWallet(refundData)
						if (!isRefunded) {
							console.log("REFUND IS NOT ADDED IN USER ACCOUNT.")
						}
					}

					general_helper.sendNotification(notificationData);
					general_helper.sendNotificationWithRestaurantId(data.restaurantId, notificationData)

					callback(null, { status: true, message: "Order status has been updated successfully." })

				})
			} else {

				callback(null, { status: false, message: "Error: Status not found. Unable to update status." })
			}

		} else {
			callback(null, { status: false, message: "Error: Order not found. Unable to update status." })
		}

	}).catch(err => {
		console.log(err)
		callback(null, { status: false, message: "Error: Internal Server Error. Unable to update status." })
	})



};

exports.VerifyUserOrder = async function (call, callback) {
	console.log(call.request)
	let sender = call.request.sender
	let receiver = call.request.receiver
	let orderId = call.request.orderId
	if (!sender || !orderId || !receiver) {
		callback(null, { status: false, message: "Incomplete information. Unable to update status." })
	}
	Order.findOne({
		where: {
			id: orderId,
			[Op.or]: [
				{
					riderId: sender,
					userId: receiver,
				},
				{
					riderId: receiver,
					userId: sender
				},
			]
		},
		include: OrderStatus
	}).then(async data => {
		console.log(data)
		if (data) {
			if (data.order_status.slug !== 'pending' && data.order_status.slug !== 'completed' && data.order_status.slug !== 'cancelled') {
				callback(null, { status: true, message: "Authorized" })
			} else {
				callback(null, { status: false, message: "Error: Order is not in active state. You Cannot message to this order conversation." })
			}
		} else {
			callback(null, { status: false, message: "Error: Order not found." })
		}

	}).catch(err => {
		console.log(err)
		callback(null, { status: false, message: "Error: Internal Server Error." })
	})



};
exports.GetRestaurantOrders = async function (call, callback) {
	let usersFiltersData = call.request.usersFiltersData
	if (usersFiltersData) {
		usersFiltersData = JSON.parse(usersFiltersData)
	} else {
		callback(null, { status: false, message: "Incomplete information. Unable to update status." })
	}

	// console.log(usersFiltersData)
	let userOrdersData = {}
	let users = Object.keys(usersFiltersData)
	for (let i = 0; i < users.length; i++) {
		let item = users[i]
		let filters = usersFiltersData[item]
		if (filters) {
			let startDate = filters.startDate
			let endDate = filters.endDate
			let where = {
				createdAt: { [Op.lte]: endDate }
			}
			if (startDate) {
				where.createdAt[Op.gt] = startDate
			}
			try {
				let orderData = await Order.findAll({
					where: where,
					include: [{ model: OrderStatus, where: { slug: "completed" }, required: true },
					{ model: Restaurant, where: { userId: Number(item) }, required: true }
					]
				})
				userOrdersData[item] = { orders: orderData }
			} catch (error) {
				userOrdersData[item] = { orders: [] }
			}
		}
	}

	return callback(null, { status: true, message: "Orders Fetched Successfully.", usersOrdersData: JSON.stringify(userOrdersData) })
};

exports.updateAcceptedStatusOfOrder = async function (call, callback) {
	console.log(call.request)
	let orderId = call.request.orderId
	if (!orderId) {
		callback(null, { status: false, message: "Incomplete information. Unable to update status." })
	}
	Order.findOne({
		where: {
			id: orderId
		}
	}).then(async data => {
		if (data) {
			// data.acceptedByRider = true
			let historyObject = {
				orderId: data.id,
				action: 'accepted_by_rider',
			};
			await general_helper.saveOrderHistory(historyObject);

			data.update({ acceptedByRider: true })
			let notificationData = {
				userId: data.userId,
				title: "Order update.",
				body: "Order Status has been updated. Click to check.",
				data: {
					action: "accepted_by_rider",
					data: { id: data.id },
				},
			};
			general_helper.sendNotificationWithRestaurantId(data.restaurantId, notificationData)

		} else {
			callback(null, { status: false, message: "Error: Order not found. Unable to update status." })
		}

	}).catch(err => {
		console.log(err)
		callback(null, { status: false, message: "Error: Internal Server Error. Unable to update status." })
	})
};
