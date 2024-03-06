const { Op, Sequelize } = require("sequelize");

const rpcClient = require("../../../lib/rpcClient");

// Modals
var Order = require("../../SqlModels/Order");
var OrderStatus = require("../../SqlModels/OrderStatus");
const { Restaurant } = require("../../SqlModels/Restaurant");

const DashboardCard = require("../../SqlModels/dashboardCard");
const OrderHistory = require("../../SqlModels/OrderHistory");
const general_helper = require("../../../helpers/general_helper");
const rpcHelper = require("../../../helpers/rpcHelper");
const { REFUNDABLE_PAYMENT_METHODS } = require("../../Constants/app.constants");
const { refundToWallet } = require("../../../helpers/rpcHelper");
const UserSetting = require("../../SqlModels/UserSetting");

exports.getAll = async function (req, res) {
	try {
		let userId = req.user.id;
		let orderStatusType = req.query.listType;
		let orderStatusWhere = {};

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

		if (orderStatusType === "new") {
			orderStatusWhere.slug = "confirmed";
		} else if (orderStatusType === "active") {
			orderStatusWhere.slug = "processed";
		} else if (orderStatusType === "past") {
			orderStatusWhere.slug = {
				[Op.in]: [
					"ready_for_delivery",
					"completed",
					"ready_for_pickup",
					"picked",
					"cancelled",
				],
			};
		}

		Order.findAll({
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
						action: 'accepted_by_restaurant'
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
							Sequelize.col("orders.createdAt"),
							"+00:00",
							"+05:00"
						),
						"createdAt",
					],
					[
						Sequelize.fn(
							"CONVERT_TZ",
							Sequelize.col("orders.updatedAt"),
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
						if (!userIds.includes(item.riderId)) {
							userIds.push(item.riderId);
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
									if (userData.id === item.userId) {
										item.user = userData;
									}
									if (userData.id === item.riderId) {
										item.rider = userData;
									}
								});

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
	} catch (error) {
		console.log(error);
		return res.status(500).send({
			message: "Internal Server Error.",
		});
	}
};

exports.getOne = async function (req, res) {
	let userId = req.user.id;
	let id = req.params.id;

	Order.findOne({
		where: {
			id,
		},
		include: [
			{
				model: OrderStatus,
				attributes: ["id", "name", "slug"],
			},
			{
				model: OrderHistory,
				where: {
					action: 'accepted_by_restaurant'
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

			{
				model: Restaurant,
				where: {
					userId: userId,
				},
			},
		],
	})
		.then(async (orderData) => {
			if (orderData) {
				let userIds = [];
				if (orderData.userId) {
					userIds.push(orderData.userId);
				}
				if (orderData.riderId) {
					userIds.push(orderData.riderId);
				}

				console.log(userIds);

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
						orderData = orderData.toJSON();
						users.map((userData) => {
							if (userData.id === orderData.userId) {
								orderData.user = userData;
							}
							if (userData.id === orderData.riderId) {
								orderData.rider = userData;
							}
						});
						if (orderData.order_history) {
							orderData.acceptedOn = orderData.order_history.acceptedOn
							delete orderData.order_history
						}

						// console.log(orderData);

						return res.send({
							data: orderData,
						});
					}
				);
			} else {
				return res.send({
					data: {},
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

exports.update = async function (req, res) {
	let userId = req.user.id;
	let id = req.body.id;
	let action = req.body.action;
	let rejectionReason = req.body.rejectionReason;

	let deliveryTime = req.body.deliveryTime;

	let orderStatusWhere = { slug: { [Op.notIn]: ["completed", "cancelled"] } }
	Order.findOne({
		where: {
			id,
		},
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
			}
		],
	}).then(async (orderData) => {
		if (orderData) {
			let where = {};
			let historyObject = {
				orderId: orderData.id,
			};
			let riderId = null
			let dashboard_card = await DashboardCard.findOne({
				where: { id: orderData.orderSummary.dashboardCardId },
			});

			if (!dashboard_card) {
				return res.status(400).send({
					message: "Unable to update order status.",
				});
			}
			let notificationAction = "";
			if (action === "accepted") {
				if (orderData.order_status.slug === "confirmed") {
					historyObject.action = "accepted_by_restaurant";
					where.slug = "processed";
					notificationAction = action;
					if (deliveryTime) {
						orderData.restaurantDeliveryTime = deliveryTime;
					}
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}

				if (dashboard_card.slug === "delivery") {

					let branchOwnRiders = false

					let userSettingsData = await UserSetting.findOne({ where: { userId: userId, slug: 'allow_my_rider', status: true } })

					if ((userSettingsData && Object.keys(userSettingsData).length) && (orderData.restaurant.branchOwnRiders == 'true' || orderData.restaurant.branchOwnRiders == true)) {
						branchOwnRiders = true
					}

					let ridersData = await new Promise((resolve, reject) => {
						rpcClient.riderRPC.getAvailableRider(
							{ latitude: orderData.restaurant.latitude, longitude: orderData.restaurant.longitude, userId: userId, branchOwnRiders: branchOwnRiders },
							async (error, respRidersData) => {
								if (error) {
									console.log(error);
									return resolve({
										message: "Unable to get riders this time.",
										status: false
									})
								}
								if (!respRidersData || !respRidersData.status) {
									return resolve({
										message: "Unable to get riders this time.",
										status: false
									})
								}

								if (!respRidersData || !respRidersData.userId) {
									return resolve({
										message: "Unable to get riders this time.",
										status: false
									})
								}
								return resolve({
									status: true,
									data: respRidersData
								})
							});
					})
					if (ridersData.status) {
						riderId = ridersData.data.userId;
						orderData.riderId = riderId
					} else {
						return res.status(400).send({
							message: ridersData.message
						})
					}
				}
			} else if (action === "declined") {
				historyObject.action = "declined_by_restaurant";
				notificationAction = action;

				if (rejectionReason) {
					orderData.orderSummary.rejectionReason = rejectionReason;
				}

				if (orderData.order_status.slug === "confirmed") {
					where.slug = "cancelled";
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
			} else if (action === "ready") {
				if (orderData.order_status.slug === "processed" && (orderData.acceptedByRider || dashboard_card.slug !== "delivery")) {
					historyObject.action = "fulfilled_by_restaurant";
					if (dashboard_card) {
						if (dashboard_card.slug === "delivery") {
							notificationAction = "ready_for_delivery";
							where.slug = "ready_for_delivery";
						} else {
							notificationAction = "ready_for_pickup";
							where.slug = "ready_for_pickup";
						}
					} else {
						return res.status(400).send({
							message: "Unable to update order status.",
						});
					}
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
			}
			else if (action === "picked") {
				if (orderData.order_status.slug === "ready_for_pickup") {
					notificationAction = "completed";
					// historyObject.action = "order_completed";
					historyObject.action = "picked_by_consumer";
					where.slug = "completed";

					let rewardPointData = {
						restaurantName: orderData.restaurant.name,
						number: orderData.orderId,
					}

					rpcClient.UserService.UpdateUserRewardPoints({
						userId: Number(orderData.userId),
						relevantId: orderData.id,
						type: 'order',
						points: orderData.orderSummary.total,
						data: JSON.stringify(rewardPointData)
					}, (err, response) => {
						if (err) console.log('rewardPointRpcError', err)
						console.log('rewardPointsRpcResponse', response)
					})

				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
				// if (
				// 	orderData.order_status.slug === "ready_for_pickup" ||
				// 	orderData.order_status.slug === "ready_for_delivery"
				// ) {

				// 	if (dashboard_card) {
				// 		if (dashboard_card.slug === "delivery") {
				// 			notificationAction = "picked";
				// 			historyObject.action = "picked_by_rider";
				// 			where.slug = "picked";
				// 		} else {
				// 			notificationAction = "completed";
				// 			historyObject.action = "order_completed";
				// 			where.slug = "completed";
				// 		}
				// 	} else {
				// 		return res.status(400).send({
				// 			message: "Unable to update order status.",
				// 		});
				// 	}
				// } else {
				// 	return res.status(400).send({
				// 		message: "Unable to update order status.",
				// 	});
				// }
			}
			else {
				return res.status(400).send({
					message: "Error: Action not allowed",
				});
			}
			let orderStatus = await OrderStatus.findOne({ where });
			if (orderStatus) {
				orderData.orderStatus = orderStatus.id;
				orderData.orderSummary = JSON.stringify(orderData.orderSummary);
				await orderData.save();
				await general_helper.saveOrderHistory(historyObject);
				let dataToSend = await Order.findOne({
					where: {
						id: orderData.id,
					},
					include: [
						{
							model: OrderStatus,
							attributes: ["id", "name", "slug"],
						},
						{
							model: OrderHistory,
							where: {
								action: 'accepted_by_restaurant'
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
						}
					],
				});

				let notificationData = {
					userId: orderData.userId,
					title: "Order Update",
					body: `Your order has been marked as ${action}`,
					data: {
						action: `order_${action}`,
						data: { id: dataToSend.id },
					},
				};
				general_helper.sendNotification(notificationData);

				if (dataToSend.riderId) {
					let riderNotificationData = {
						userId: dataToSend.riderId,
						title: "Order Update",
						body: `Order has been marked as ${action}`,
						data: {
							action: `order_${action}`,
							data: { id: dataToSend.id },
						},
					};
					if (action === "accepted") {
						riderNotificationData.title = "New Order"
						riderNotificationData.body = "You have new order. Click for more details."
						riderNotificationData.data.action = "new_order"
					}
					general_helper.sendNotification(riderNotificationData);
				}


				dataToSend = dataToSend.toJSON();
				if (dataToSend.order_history) {
					dataToSend.acceptedOn = dataToSend.order_history.acceptedOn
					delete dataToSend.order_history
				}

				if (action === "declined") {
					if (dataToSend.riderId) {
						rpcHelper.updateRiderOccupyStatus(false, dataToSend.riderId)
					}
					console.log(dataToSend)
					if (dataToSend.orderSummary
						&& dataToSend.orderSummary.paymentMethod
						&& (REFUNDABLE_PAYMENT_METHODS.includes(dataToSend.orderSummary.paymentMethod.slug))) {
						let data = {
							amount: dataToSend.orderSummary.total,
							userId: dataToSend.userId,
							paymentSummary: { message: "Order cancelled by restaurant. Credits has been added to wallet." },
							orderId: dataToSend.id
						}
						let isRefunded = await refundToWallet(data)
						if (!isRefunded) {
							console.log("REFUND IS NOT ADDED IN USER ACCOUNT.")
						}
					}
				}
				else if (action === "accepted") {
					dataToSend.restaurant = orderData.restaurant
					if (dataToSend.riderId) {
						rpcHelper.updateRiderOccupyStatus(true, dataToSend.riderId, dataToSend)
					}
				}

				if (dashboard_card.slug === "delivery" && action !== "accepted") {
					rpcHelper.updateOrderStatus(dataToSend.order_status.slug, dataToSend.id)

				}

				return res.send({
					message: `Order has been marked as ${action}`,
					data: dataToSend,
				});
			} else {
				return res.status(400).send({
					message: "Unable to update order status.",
				});
			}
		} else {
			return res.status(400).send({
				message: "Unable to update order status.",
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

exports.adjustTime = async function (req, res) {
	let userId = req.user.id;
	let id = req.body.id;
	let deliveryTime = req.body.deliveryTime;

	Order.findOne({
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
	})
		.then(async (orderData) => {
			if (orderData) {
				orderData.restaurantDeliveryTime = deliveryTime;
				orderData.orderSummary = JSON.stringify(orderData.orderSummary);
				await orderData.save();
				return res.send({
					message: `Order time has been changed successfully.`,
					data: orderData,
				});
			} else {
				return res.status(400).send({
					message: "Unable to update order.",
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


exports.putV2RestaurantOnly = async function (req, res) {
	let userId = req.user.id;
	let id = req.body.id;
	let action = req.body.action;
	let rejectionReason = req.body.rejectionReason;

	let deliveryTime = req.body.deliveryTime;

	let orderStatusWhere = { slug: { [Op.notIn]: ["completed", "cancelled"] } }
	Order.findOne({
		where: {
			id,
		},
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
			}
		],
	}).then(async (orderData) => {
		if (orderData) {
			let where = {};
			let historyObject = {
				orderId: orderData.id,
			};
			let riderId = req.body.riderId
			let dashboard_card = await DashboardCard.findOne({
				where: { id: orderData.orderSummary.dashboardCardId },
			});

			if (!dashboard_card) {
				return res.status(400).send({
					message: "Unable to update order status.",
				});
			}
			if (dashboard_card.slug === "delivery" && action === "accepted") {
				if (!riderId) {
					return res.status(422).send({
						message: "Error: Unable to find rider Id. Rider Id required.",
					});
				}
				let response = await rpcHelper.verifyRestaurantRider(riderId, userId)
				if (!response || !response.status) {
					return res.status(400).send({
						message: response ? response.message : "Error: Unable to find active rider.",
					});
				}
			}
			let notificationAction = "";
			if (action === "accepted") {
				if (orderData.order_status.slug === "confirmed") {
					historyObject.action = "accepted_by_restaurant";
					where.slug = "processed";
					notificationAction = action;
					if (deliveryTime) {
						orderData.restaurantDeliveryTime = deliveryTime;
					}
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
				console.log(dashboard_card.slug)
				if (dashboard_card.slug === "delivery") {
					orderData.riderId = riderId
				}
			} else if (action === "declined") {
				historyObject.action = "declined_by_restaurant";
				notificationAction = action;

				if (rejectionReason) {
					orderData.orderSummary.rejectionReason = rejectionReason;
				}

				if (orderData.order_status.slug === "confirmed") {
					where.slug = "cancelled";
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
			} else if (action === "ready") {
				if (orderData.order_status.slug === "processed" && (orderData.acceptedByRider || dashboard_card.slug !== "delivery")) {
					historyObject.action = "fulfilled_by_restaurant";
					if (dashboard_card) {
						if (dashboard_card.slug === "delivery") {
							notificationAction = "ready_for_delivery";
							where.slug = "ready_for_delivery";
						} else {
							notificationAction = "ready_for_pickup";
							where.slug = "ready_for_pickup";
						}
					} else {
						return res.status(400).send({
							message: "Unable to update order status.",
						});
					}
				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
			}
			else if (action === "picked") {
				if (orderData.order_status.slug === "ready_for_pickup") {
					notificationAction = "completed";
					// historyObject.action = "order_completed";
					historyObject.action = "picked_by_consumer";
					where.slug = "completed";

					let rewardPointData = {
						restaurantName: orderData.restaurant.name,
						number: orderData.orderId,
					}

					rpcClient.UserService.UpdateUserRewardPoints({
						userId: Number(orderData.userId),
						relevantId: orderData.id,
						type: 'order',
						points: orderData.orderSummary.total,
						data: JSON.stringify(rewardPointData)
					}, (err, response) => {
						if (err) console.log('rewardPointRpcError', err)
						console.log('rewardPointsRpcResponse', response)
					})

				} else {
					return res.status(400).send({
						message: "Unable to update order status.",
					});
				}
				// if (
				// 	orderData.order_status.slug === "ready_for_pickup" ||
				// 	orderData.order_status.slug === "ready_for_delivery"
				// ) {

				// 	if (dashboard_card) {
				// 		if (dashboard_card.slug === "delivery") {
				// 			notificationAction = "picked";
				// 			historyObject.action = "picked_by_rider";
				// 			where.slug = "picked";
				// 		} else {
				// 			notificationAction = "completed";
				// 			historyObject.action = "order_completed";
				// 			where.slug = "completed";
				// 		}
				// 	} else {
				// 		return res.status(400).send({
				// 			message: "Unable to update order status.",
				// 		});
				// 	}
				// } else {
				// 	return res.status(400).send({
				// 		message: "Unable to update order status.",
				// 	});
				// }
			}
			else {
				return res.status(400).send({
					message: "Error: Action not allowed",
				});
			}
			let orderStatus = await OrderStatus.findOne({ where });
			if (orderStatus) {
				orderData.orderStatus = orderStatus.id;
				orderData.acceptedByRider = true;
				orderData.riderType = "business";
				orderData.orderSummary = JSON.stringify(orderData.orderSummary);
				await orderData.save();
				await general_helper.saveOrderHistory(historyObject);
				let dataToSend = await Order.findOne({
					where: {
						id: orderData.id,
					},
					include: [
						{
							model: OrderStatus,
							attributes: ["id", "name", "slug"],
						},
						{
							model: OrderHistory,
							where: {
								action: 'accepted_by_restaurant'
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
						}
					],
				});

				let notificationData = {
					userId: orderData.userId,
					title: "Order Update",
					body: `Your order has been marked as ${action}`,
					data: {
						action: `order_${action}`,
						data: { id: dataToSend.id },
					},
				};
				general_helper.sendNotification(notificationData);

				if (dataToSend.riderId) {
					let riderNotificationData = {
						userId: dataToSend.riderId,
						title: "Order Update",
						body: `Order has been marked as ${action}`,
						data: {
							action: `order_${action}`,
							data: { id: dataToSend.id },
						},
					};
					if (action === "accepted") {
						riderNotificationData.title = "New Order"
						riderNotificationData.body = "You have new order. Click for more details."
						riderNotificationData.data.action = "new_order"
					}
					general_helper.sendNotification(riderNotificationData);
				}


				dataToSend = dataToSend.toJSON();
				if (dataToSend.order_history) {
					dataToSend.acceptedOn = dataToSend.order_history.acceptedOn
					delete dataToSend.order_history
				}

				if (action === "declined") {
					if (dataToSend.riderId) {
						rpcHelper.updateRiderOccupyStatus(false, dataToSend.riderId)
					}
					console.log(dataToSend)
					if (dataToSend.orderSummary
						&& dataToSend.orderSummary.paymentMethod
						&& (REFUNDABLE_PAYMENT_METHODS.includes(dataToSend.orderSummary.paymentMethod.slug))) {
						let data = {
							amount: dataToSend.orderSummary.total,
							userId: dataToSend.userId,
							paymentSummary: { message: "Order cancelled by restaurant. Credits has been added to wallet." },
							orderId: dataToSend.id
						}
						let isRefunded = await refundToWallet(data)
						if (!isRefunded) {
							console.log("REFUND IS NOT ADDED IN USER ACCOUNT.")
						}
					}
				}
				else if (action === "accepted") {
					dataToSend.restaurant = orderData.restaurant
					if (dataToSend.riderId) {
						rpcHelper.assignOrderToRider(dataToSend.riderId, dataToSend)
					}
				}

				if (dashboard_card.slug === "delivery" && action !== "accepted") {
					rpcHelper.updateOrderStatus(dataToSend.order_status.slug, dataToSend.id)
				}

				return res.send({
					message: `Order has been marked as ${action}`,
					data: dataToSend,
				});
			} else {
				return res.status(400).send({
					message: "Unable to update order status.",
				});
			}
		} else {
			return res.status(400).send({
				message: "Unable to update order status.",
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
