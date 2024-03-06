
// Libraries
const moment = require("moment");
const sequelize = require("sequelize");
const { Op, where } = require("sequelize");
const { find } = require("geo-tz");

// Custom Libraries
const rpcClient = require("../../lib/rpcClient");

// Models
const { Restaurant } = require("../SqlModels/Restaurant");
const Order = require("../SqlModels/Order");
const Booking = require("../SqlModels/Booking");
const RestaurantTiming = require("../SqlModels/RestaurantTiming");
const OrderStatus = require("../SqlModels/OrderStatus");

const RestaurantMedia = require("../SqlModels/RestaurantMedia");

// Constants
const app_constants = require("../Constants/app.constants");
const general_helper = require("../../helpers/general_helper");
const { TIMESTAMP_FORMAT } = require("../Constants/app.constants");



exports.restaurantSuspendedStatus = async function () {

	try {
		const ChangeUserStatus = (userId) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient?.UserService?.ChangeUserStatus({
						userId: userId,
						userStatus: 'active',
					}, function (error, data) {
						if (error) {
							return reject(error)
						}
						return resolve(data)
					});
				} catch (error) {
					return reject(error)
				}

			})
		}

		let restaurantList = await Restaurant.findAll({
			where: {
				deleteStatus: false,
				status: "suspended",
				[Op.not]: [
					{
						suspensionDate: null
					}
				]
			},
		});

		let currentDate = new Date()
		// console.log('===============current Date suspension============', currentDate);
		currentDate = moment(currentDate).utc().format(
			app_constants.TIMESTAMP_FORMAT
		);


		for (const restaurant of restaurantList) {
			let restaurantSuspensionTime = restaurant.suspensionDate
			restaurantSuspensionTime = moment(restaurantSuspensionTime).utc().format(
				app_constants.TIMESTAMP_FORMAT
			);
			// console.log('===============current Date suspension loop============', currentDate);
			// console.log('===============suspend Date suspension loop============', restaurantSuspensionTime);

			currentDate = moment(currentDate, app_constants.TIMESTAMP_FORMAT);
			restaurantSuspensionTime = moment(restaurantSuspensionTime, app_constants.TIMESTAMP_FORMAT);
			if (restaurantSuspensionTime.isSameOrBefore(currentDate)) {
				// console.log('=================times up of restaurant suspension=================');
				let restaurantUpdateData = {
					suspensionDate: null,
					status: 'active'
				}

				await ChangeUserStatus(restaurant.userId);

				restaurant.update(restaurantUpdateData).then(updatedData => {
				}).catch((err) => {
					console.log(err);
				})
			}
		}
	} catch (error) {
		console.log(error);
	}
};

exports.restaurantAutoStatus = async function () {
	try {
		let restaurantList = await Restaurant.findAll({
			where: {
				deleteStatus: false,
				status: "active",
			},
		});

		for (const restaurant of restaurantList) {
			let timezones = find(restaurant.latitude, restaurant.longitude);
			if (!timezones && !timezones.length) {
				// console.log("RestaurantTimezone not found");
				continue;
			}

			// console.log("");
			// console.log("===== Current Dates =====");

			let currentDateTime = moment()
				.tz(timezones[0])
				.format(app_constants.TIMESTAMP_FORMAT);
			// console.log("Current DateTime:", currentDateTime);

			let currentDate = moment(currentDateTime).format(
				app_constants.DATE_FORMAT
			);
			// console.log("Current Date:", currentDate);
			// 
			let currentDay = moment(currentDateTime).format("dddd");
			// console.log("Current Day:", currentDay);

			let currentTime = moment(currentDateTime).format("h:mm A");
			// console.log("Current Time", currentTime);

			// console.log("===== End Current Dates =====");

			// console.log("");

			restaurant.restaurant_timings = await restaurant.getRestaurant_timings({
				where: {
					deleteStatus: false,
					day: currentDay,
				},
				required: false,
				attributes: ["id", "day"],
			});

			let parsedNextOpeningTime = null;
			// console.log("restaurant.nextOpeningTime:", restaurant.nextOpeningTime);
			if (restaurant.nextOpeningTime) {
				parsedNextOpeningTime = moment(
					restaurant.nextOpeningTime,
					app_constants.TIMESTAMP_FORMAT
				);
			}

			let isOpen = null;
			// console.log(
			// 	`Restaurant ${restaurant.name} is ${restaurant.isOpen ? "open" : "closed"
			// 	}`
			// );
			// console.log("");
			const restaurantTime = restaurant.restaurant_timings[0];
			if (!restaurantTime) {
				isOpen = false;
			} else {
				let timeLaps = await restaurantTime.getRestaurant_time_laps();
				for (const timeLap of timeLaps) {
					let to = moment(timeLap.to, "h:mma");
					let from = moment(timeLap.from, "h:mma");
					let parsedCurrentTime = moment(currentTime, "h:mma");

					// console.log("===== Time Laps =====");
					// console.log("to:", to);
					// console.log("current:", parsedCurrentTime);
					// console.log("from:", from);
					// console.log("===== End Time Laps =====");
					// console.log("");

					if (restaurant.manualStatus === "closed") {
						// console.log(parsedNextOpeningTime);
						if (parsedNextOpeningTime) {
							if (
								parsedNextOpeningTime.isBefore(currentDateTime) &&
								from.isBefore(parsedCurrentTime) &&
								parsedCurrentTime.isBefore(to)
							) {
								// console.log("here");
								isOpen = true;
								restaurant.manualStatus = null;
								restaurant.nextOpeningTime = null;
								break;
							} else {
								isOpen = false;
							}
						} else {
							isOpen = false;
						}
					} else if (
						from.isBefore(parsedCurrentTime) &&
						parsedCurrentTime.isBefore(to)
					) {
						isOpen = true;
						break;
					}
				}
			}

			if (isOpen !== true) {
				isOpen = false;
			}
			// console.log(
			// 	`Restaurant ${restaurant.name} is ${isOpen ? "open" : "closed"}`
			// );
			restaurant.isOpen = isOpen;
			await restaurant.save();
		}
	} catch (error) {
		console.log(error);
	}
};

// exports.restaurantAutoCancelOrders = async function () {
// 	try {
// 		// console.log("===== Current Dates =====");

// 		let currentDateTime = moment().format(app_constants.TIMESTAMP_FORMAT);

// 		// console.log("Current DateTime:", currentDateTime);

// 		let cancelOrdersDateTime = moment(currentDateTime).subtract(1, "day");
// 		// console.log(cancelOrdersDateTime);

// 		Order.findAll({
// 			where: {
// 				createdAt: { [Op.lt]: cancelOrdersDateTime },
// 			},
// 			include: {
// 				model: OrderStatus,
// 				attributes: ["id", "slug"],
// 				where: {
// 					slug: {
// 						[Op.in]: [
// 							"confirmed",
// 							"processed",
// 							"pending",
// 							"ready_for_pickup",
// 							"ready_for_delivery",
// 						],
// 					},
// 				},
// 			}
// 		}).then(async (orderData) => {
// 			// console.log(orderData);
// 			if (orderData && orderData.length) {
// 				let cancelledStatus = await OrderStatus.findOne({
// 					where: { slug: "cancelled" },
// 				});
// 				if (cancelledStatus) {
// 					let ordersIds = orderData.map((item) => item.id);
// 					Order.update(
// 						{ orderStatus: cancelledStatus.id },
// 						{ where: { id: { [Op.in]: ordersIds } } }
// 					);
// 					rpcClient.ChatRPC.bulkDeactivateConversation({
// 						orderIds: ordersIds
// 					}, (err, response) => {
// 						console.log(err, response)
// 					})
// 				}
// 			}
// 		});
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

// exports.restaurantAutoCancelOrdersIfNotAccepted = async function () {
// 	try {
// 		let currentDateTime = moment().format(app_constants.TIMESTAMP_FORMAT);
// 		let cancelOrdersDateTime = moment(currentDateTime).subtract(5, "minutes");

// 		Order.findAll({
// 			where: {
// 				createdAt: { [Op.lt]: cancelOrdersDateTime },
// 			},
// 			include: [
// 				{
// 					model: OrderStatus,
// 					attributes: ["id", "slug"],
// 					where: {
// 						slug: {
// 							[Op.in]: ["confirmed"],
// 						},
// 					},
// 				},
// 				{
// 					model: Restaurant,
// 				},
// 			],
// 		}).then(async (orderData) => {
// 			if (orderData && orderData.length) {
// 				let cancelledStatus = await OrderStatus.findOne({
// 					where: { slug: "cancelled" },
// 				});
// 				if (cancelledStatus) {
// 					let ordersIds = [];
// 					let userNotificationIds = [];
// 					let notificationIds = [];
// 					orderData.map((item) => {
// 						ordersIds.push(item.id);
// 						userNotificationIds.push(item.userId);
// 						notificationIds.push(item.restaurant.userId);
// 						let notificationData = {
// 							userId: item.userId,
// 							title: "Order Cancelled",
// 							body: "Order has been cancelled. Click to check.",
// 							data: {
// 								action: "order_cancelled",
// 								data: { id: item.id },
// 							},
// 						};
// 						general_helper.sendNotification(notificationData)
// 					});
// 					Order.update(
// 						{ orderStatus: cancelledStatus.id },
// 						{ where: { id: { [Op.in]: ordersIds } } }
// 					);
// 					rpcClient.SocketRPC.SendEvent(
// 						{
// 							socketEventName: "orderCancelled",
// 							instanceName: "restaurantSocket",
// 							userIds: notificationIds,
// 							data: "",
// 						},
// 						function (data) {
// 							console.log("Order Cancelled");
// 						}
// 					);
// 					rpcClient.ChatRPC.bulkDeactivateConversation({
// 						orderIds: ordersIds
// 					}, (err, response) => {
// 						console.log(err, response)
// 					})
// 				}
// 			}
// 		});
// 	} catch (error) {
// 		console.log(error);
// 	}
// };


// exports.restaurantAutoCancelBookingsIfNotAccepted = async function () {
// 	try {
// 		// console.log("===== Current Dates =====");

// 		let currentDateTime = moment().format(app_constants.TIMESTAMP_FORMAT);

// 		// console.log("Current DateTime:", currentDateTime);

// 		let cancelBookingDateTime = moment(currentDateTime).add(45, "minutes").format("YYYY-MM-DD hh:mm:ss"); //change minute value to super admin defined value
// 		// console.log("cancelBookingDateTime", cancelBookingDateTime)
// 		Booking.findAll({
// 			where: {
// 				bookingDateTime: { [Op.lt]: cancelBookingDateTime },
// 			},
// 			include: [{
// 				model: OrderStatus,
// 				attributes: ["id", "slug"],
// 				where: {
// 					slug: {
// 						[Op.in]: [
// 							"confirmed",
// 							"pending"
// 						],
// 					},
// 				},
// 			},
// 			{
// 				model: Restaurant,
// 			}]
// 		}).then(async (bookingData) => {
// 			if (bookingData.length) {
// 				// console.log(bookingData.length)
// 				let cancelledStatus = await OrderStatus.findOne({
// 					where: { slug: "cancelled" },
// 				});
// 				if (cancelledStatus) {
// 					let ordersIds = [];
// 					let userNotificationIds = [];
// 					let notificationIds = [];
// 					bookingData.map((item) => {
// 						let notificationData = {
// 							userId: item.userId,
// 							title: "Booking Cancelled",
// 							body: "Booking has been cancelled. Click to check.",
// 							data: {
// 								action: "booking_cancelled",
// 								data: { id: item.id },
// 							},
// 						};
// 						general_helper.sendNotification(notificationData)
// 						general_helper.sendNotificationWithRestaurantId(item.restaurantId, notificationData)

// 						ordersIds.push(item.id);
// 						userNotificationIds.push(item.userId);
// 						notificationIds.push(item.restaurant.userId);
// 					});
// 					Booking.update(
// 						{ bookingStatusId: cancelledStatus.id },
// 						{ where: { id: { [Op.in]: ordersIds } } }
// 					);

// 				}
// 			}
// 		});
// 	} catch (error) {
// 		console.log(error);
// 	}
// };


exports.restaurantAutoCompleteBookingsIfAccepted = async function () {
	try {
		// console.log("===== Current Dates =====");

		let currentDateTime = moment().format(app_constants.TIMESTAMP_FORMAT);

		// console.log("Current DateTime:", currentDateTime);

		let completeBookingDateTime = moment(currentDateTime).subtract(2, "hours").format("YYYY-MM-DD hh:mm:ss"); //change minute value to super admin defined value
		// console.log("cancelBookingDateTime", cancelBookingDateTime)
		Booking.findAll({
			where: {
				bookingDateTime: { [Op.lt]: completeBookingDateTime },
			},
			include: [{
				model: OrderStatus,
				attributes: ["id", "slug"],
				where: {
					slug: {
						[Op.notIn]: [
							"confirmed",
							"pending",
							"completed",
							"cancelled",
						],
					},
				},
			},
			{
				model: Restaurant,
			}]
		}).then(async (bookingData) => {
			if (bookingData.length) {
				// console.log(bookingData.length)
				let completeStatus = await OrderStatus.findOne({
					where: { slug: "completed" },
				});
				if (completeStatus) {
					let ordersIds = [];
					let userNotificationIds = [];
					let notificationIds = [];
					bookingData.map((item) => {
						let notificationData = {
							userId: item.userId,
							title: "Booking completed",
							body: "Booking has been completed. Click to check.",
							data: {
								action: "booking_completed",
								data: { id: item.id },
							},
						};
						general_helper.sendNotification(notificationData)
						general_helper.sendNotificationWithRestaurantId(item.restaurantId, notificationData)

						ordersIds.push(item.id);
						userNotificationIds.push(item.userId);
						notificationIds.push(item.restaurant.userId);
					});
					Booking.update(
						{ bookingStatusId: completeStatus.id },
						{ where: { id: { [Op.in]: ordersIds } } }
					);

				}
			}
		});
	} catch (error) {
		console.log(error);
	}
};


exports.sendEmailAndNotificationIfBookingNotAccepted = async function () {
	try {
		// console.log("===== Current Dates =====");

		let currentDateTime = moment().format('YYYY-MM-DD hh:mm');

		// console.log("Current DateTime:", currentDateTime);

		// let cancelBookingDateTime = moment(currentDateTime).add(45, "minutes").format("YYYY-MM-DD hh:mm:ss"); //change minute value to super admin defined value
		// console.log("cancelBookingDateTime", cancelBookingDateTime)
		Booking.findAll({
			where: {
				// bookingDateTime: { [Op.lt]: cancelBookingDateTime },
			},
			include: [{
				model: OrderStatus,
				attributes: ["id", "slug"],
				where: {
					slug: {
						[Op.in]: [
							"confirmed",
							"pending"
						],
					},
				},
			},
			{
				model: Restaurant,
			}]
		}).then(async (bookingData) => {
			if (bookingData.length) {
				bookingData.map((item) => {
					let minus45Min = moment(item.bookingDateTime).subtract(45, 'minutes').format('YYYY-MM-DD hh:mm');
					let minus60Min = moment(item.bookingDateTime).subtract(60, 'minutes').format('YYYY-MM-DD hh:mm');
					let minus2Hour = moment(item.bookingDateTime).subtract(2, 'hours').format('YYYY-MM-DD hh:mm');
					let minus24Hour = moment(item.bookingDateTime).subtract(24, 'hours').format('YYYY-MM-DD hh:mm');

					// console.log(currentDateTime === minus45Min || currentDateTime === minus60Min || currentDateTime === minus2Hour || currentDateTime === minus24Hour, minus45Min, minus60Min, minus2Hour, minus24Hour)
					if (currentDateTime === minus45Min || currentDateTime === minus60Min || currentDateTime === minus2Hour || currentDateTime === minus24Hour) {
						let notificationData = {
							userId: item.userId,
							title: "Booking Pending",
							body: "We will inform you as soon as restaurant accepts your booking. Thanks for your ",
							data: {
								action: "booking_pending",
								data: { id: item.id },
							},
						};
						general_helper.sendNotification(notificationData)

						let emailData = {
							restaurantName: item.restaurant.name
						}


						rpcClient.MainService.SendEmailByUserId({
							subject: 'Pending Booking Update',
							userId: item.userId,
							template: 'user/pendingBooking.pug',
							templateData: JSON.stringify(emailData)
						}, function (error, sendEmailResponse) {
							console.log('email error', error, sendEmailResponse)
						})
					}
					// general_helper.sendNotificationWithRestaurantId(item.restaurantId, notificationData)

					// ordersIds.push(item.id);
					// userNotificationIds.push(item.userId);
					// notificationIds.push(item.restaurant.userId);
				});
				// console.log(bookingData.length)
				// let cancelledStatus = await OrderStatus.findOne({
				// 	where: { slug: "cancelled" },
				// });
				// if (cancelledStatus) {
				// 	let ordersIds = [];
				// 	let userNotificationIds = [];
				// 	let notificationIds = [];
				// 	bookingData.map((item) => {
				// 		let notificationData = {
				// 			userId: item.userId,
				// 			title: "Booking Cancelled",
				// 			body: "Booking has been cancelled. Click to check.",
				// 			data: {
				// 				action: "booking_cancelled",
				// 				data: { id: item.id },
				// 			},
				// 		};
				// 		general_helper.sendNotification(notificationData)
				// 		general_helper.sendNotificationWithRestaurantId(item.restaurantId, notificationData)

				// 		ordersIds.push(item.id);
				// 		userNotificationIds.push(item.userId);
				// 		notificationIds.push(item.restaurant.userId);
				// 	});
				// 	// Booking.update(
				// 	// 	{ bookingStatusId: cancelledStatus.id },
				// 	// 	{ where: { id: { [Op.in]: ordersIds } } }
				// 	// );

				// }
			}
		});
	} catch (error) {
		console.log(error);
	}
};



exports.mediaDocumentExpiry = async function () {
	try {
		const sendAndSaveNotification = (userIds, notificationData) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient?.SocketRPC?.SendAndSaveNotification({
						socketInstance: 'restaurantSocket',
						socketEventName: app_constants.SOCKET_EVENTS.BROADCAST_PROVIDER_NOTIFICATION,
						userIds: userIds,
						subtract: 'Document Expired!',
						description: 'Your document has been expired',
						appName: 'asaap-restaurant',
						type: 'user',
						notificationData: JSON.stringify(notificationData)
					}, function (error, data) {
						if (error) {
							return reject(error)
						}
						return resolve(data)
					});
				} catch (error) {
					return reject(error)
				}

			})
		}

		const ChangeUserStatus = (userId, suspendData) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient?.UserService?.ChangeUserStatus({
						userId: userId,
						userStatus: 'suspended',
						reasonData: suspendData
					}, function (error, data) {
						if (error) {
							return reject(error)
						}
						return resolve(data)
					});
				} catch (error) {
					return reject(error)
				}

			})
		}

		let restaurantMedias = await RestaurantMedia.findAll({
			// where: {
			// 	deleteStatus: false,
			// 	status: 'active',
			// },
			include: [{
				model: Restaurant,
				where: {
					deleteStatus: false,
					[Op.not]: {
						status: 'suspended'
					}
				},
				attributes: ['id', 'name', 'userId', 'providerId', 'status', "specialInstructions"],
				required: true
			}]
		})


		let currentDate = moment().format(app_constants.DATE_FORMAT);

		let usedIds = []

		restaurantMedias.forEach(async (restaurantMedia) => {

			let userId = usedIds.find(a => a == restaurantMedia.restaurant.userId)

			usedIds.push(restaurantMedia.restaurant.userId)
			let diff10Day = moment(restaurantMedia?.expiryDate).subtract(10, 'd').format(app_constants.DATE_FORMAT)
			let diff5Day = moment(restaurantMedia?.expiryDate).subtract(5, 'd').format(app_constants.DATE_FORMAT)
			let diff0Day = moment(restaurantMedia?.expiryDate).format(app_constants.DATE_FORMAT)
			if (restaurantMedia.expiryDate && (currentDate === diff10Day || currentDate === diff5Day)) {

				await sendAndSaveNotification([restaurantMedia.restaurant.userId], restaurantMedia);

			}
			else if (restaurantMedia.expiryDate && currentDate === diff0Day) {
				if (!userId) {

					usedIds.push(restaurantMedia.restaurant.userId)

					await Restaurant.update(
						{
							status: 'suspended'
						},
						{
							where: {
								id: restaurantMedia.restaurant.id
							}
						}
					)

					let suspendData = {
						suspendedBy: 'system',
						suspendSlug: 'documentExpiry',
						suspendReason: 'account suspended due to document expiry',
					}

					await ChangeUserStatus(restaurantMedia.restaurant.userId, JSON.stringify(suspendData));

				}
			}
		})
	} catch (error) {
		console.log(error)
	}
}

