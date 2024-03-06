// Libraries
const { Op, where, Sequelize } = require("sequelize");
const sequelize = require("sequelize");
const moment = require("moment");
const { find } = require("geo-tz");

// Custom Libraries
const rpcClient = require("../../lib/rpcClient");

// helpers
const general_helper = require("../../helpers/general_helper");
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')
// const { saveRecentSearch } = require('../../helpers/general_helper');
const approvalHelper = require("../../helpers/approvalHelper");
// const approvalFunctions = Object.keys(approvalHelper)

// Modals
const { Restaurant } = require("../SqlModels/Restaurant");
const FoodType = require("../SqlModels/FoodType");
const { RestaurantProfile } = require("../SqlModels/RestaurantProfile");
const RestaurantMedia = require("../SqlModels/RestaurantMedia");
const RestaurantTiming = require("../SqlModels/RestaurantTiming");
// const RestaurantPaymentMethod = require('../SqlModels/RestaurantPaymentMethod');
const RestaurantType = require("../SqlModels/RestaurantTypes");
const RestaurantFoodMenu = require("../SqlModels/RestaurantFoodMenu");
const RestaurantListType = require("../SqlModels/RestaurantListType");
const RestaurantTimeLap = require("../SqlModels/RestaurantTimeLaps");
const RestaurantDashboardCard = require("../SqlModels/RestaurantDashboardCard");
const { Favourite } = require("../SqlModels/Restaurant");
const DashboardCard = require("../SqlModels/dashboardCard");
const Review = require("../SqlModels/Review");
const RestaurantMenuProduct = require("../SqlModels/RestaurantMenuProduct");
const RestaurantApproval = require("../SqlModels/RestaurantApproval");
const DeliveryRates = require('../SqlModels/DeliveryRates')

// configurations
const { sequelize_conn } = require('../../../config/database')


// Constants
const app_constants = require("../Constants/app.constants");
const { IsValidJSONString, checkValue, addBranchBankAccountDetails } = require("../../helpers/general_helper");
// const approvalHelper = require("../../helpers/approvalHelper");

//  RPC Methods
exports.store = async function (call, callback) {
	try {
		let data = JSON.parse(call.request.data);
		console.log('data', data);
		let restaurant = await Restaurant.findOne({
			where: {
				providerId: data.providerId,
				userId: data.userId,
			},
		});

		if (!restaurant) {
			restaurant = new Restaurant({
				name: data.restaurantName,
				userId: data.userId,
				providerId: data.providerId,
				address: data.address,
				longitude: data.longitude,
				latitude: data.latitude,
				deliveryOption: data.deliveryOption
			});
			await restaurant.save();
		} else {
			restaurant.name = data.restaurantName;
			restaurant.address = data.address;
			restaurant.longitude = data.longitude;
			restaurant.latitude = data.latitude;
		}

		restaurant.deliveryOption = data.deliveryOption

		restaurant.deliveryTime = data.deliveryTime

		restaurant.specialInstructions = data.specialInstructions

		restaurant.listTypeId = data.listTypeId ? data.listTypeId : 6

		restaurant.deliveryRatePerMile = data.deliveryRatePerMile ? data.deliveryRatePerMile : 0

		restaurant.branchOwnRiders = data.branchOwnRiders ? data.branchOwnRiders : 0

		restaurant.branchOwnRidersCod = data.branchOwnRidersCod ? data.branchOwnRidersCod : 0

		restaurant.restaurantWebsiteLink = data.restaurantLink ? data.restaurantLink : ''

		restaurant.vatNumber = data.vatNumber ? data.vatNumber : ''

		restaurant.isVat = data.isVat ? data.isVat : false

		let restaurantProfile = await RestaurantProfile.findOne({
			where: {
				restaurantId: restaurant.id,
			},
		});

		if (!restaurantProfile) {
			restaurantProfile = new RestaurantProfile({
				restaurantId: restaurant.id,
			});
		}

		if (data.minDeliveryOrderPrice) {
			restaurant.minDeliveryOrderPrice = data.minDeliveryOrderPrice
			restaurantProfile.minDeliveryOrderPrice = data.minDeliveryOrderPrice
		}

		restaurantProfile.deliveryCharges = data.deliveryCharges
		restaurant.deliveryCharges = data.deliveryCharges

		restaurantProfile.deliveryRadius = data.deliveryRadius
		restaurant.deliveryRadius = data.deliveryRadius

		restaurantProfile.currency = data.currency
		restaurant.currency = data.currency

		restaurantProfile.currencySymbol = data.currencySymbol
		restaurant.currencySymbol = data.currencySymbol

		restaurantProfile.companyName = data.companyName;

		restaurantProfile.capacity = data.sittingCapacity ? data.sittingCapacity : null;

		restaurantProfile.postCode = data.postcode;
		if (data.menuLink) {
			restaurantProfile.menuLink = data.menuLink;
		}
		restaurantProfile.fsaId = data.fsaId;
		restaurantProfile.fsaLink = data.fsaLink;
		restaurantProfile.fsaStatus = data.fsaStatus;
		if (data.vat) {
			restaurantProfile.vat = data.vat;
			restaurant.vat = data.vat;
		}
		restaurantProfile.deliveryTime = data.deliveryTime;
		if (data.street) {
			restaurantProfile.street = data.street;
		}
		if (data.cityId) {
			restaurantProfile.cityId = data.cityId;
			restaurant.city = data.cityId;
		}

		await restaurantProfile.save();

		// console.log('RestaurantMedia', data.businessMedia)
		await RestaurantMedia.destroy({
			where: {
				restaurantId: restaurant.id,
			},
		});

		if (data.businessMedia) {
			let bulkRestaurantMedias = [];
			for (const mediaType in data.businessMedia) {
				if (
					mediaType === "logo" &&
					data.businessMedia[mediaType] &&
					data.businessMedia[mediaType].length
				) {
					restaurant.image = data.businessMedia[mediaType][0];
				}

				if (
					mediaType === "banner" &&
					data.businessMedia[mediaType] &&
					data.businessMedia[mediaType].length
				) {
					restaurant.coverImage = data.businessMedia[mediaType][0];
				}

				console.log("mediaType:", data.businessMedia[mediaType]);
				data.businessMedia[mediaType].map((media) => {
					bulkRestaurantMedias.push({
						mediaType: mediaType,
						media: media,
						restaurantId: restaurant.id,
					});
				});
			}
			console.log("bulkRestaurantMedias", bulkRestaurantMedias);
			await RestaurantMedia.bulkCreate(bulkRestaurantMedias);
		}
		// let media = new RestaurantMedia({
		//     license: data.license,
		//     menuImage: data.menuImage,
		//     alcoholLicense: data.alcoholLicense,
		//     image: data.logo,
		//     coverImage: data.coverImage
		// })

		// RestaurantTiming work

		await RestaurantTiming.destroy({
			where: {
				restaurantId: restaurant.id,
			},
		});

		let times = data.timing;
		times = times.map((item) => {
			return (item = { ...item, restaurantId: restaurant.id });
		});

		let savedTimes = await RestaurantTiming.bulkCreate(times);

		// RestaurantTime Slots work
		await RestaurantTimeLap.destroy({
			where: {
				restaurantId: restaurant.id,
			},
		});

		var slots = [];
		// console.log('savedTimes', times);

		for (let index = 0; index < savedTimes.length; index++) {
			let fnd = times.find((e) => {
				if (savedTimes[index].day == e.day) {
					return e;
				}
			});

			let timeLaps = fnd.laps;
			if (timeLaps) {
				for (let indx = 0; indx < timeLaps.length; indx++) {
					slots.push({
						from: timeLaps[indx].startTime,
						to: timeLaps[indx].endTime,
						restaurantTimingId: savedTimes[index].id,
						restaurantId: restaurant.id,
					});
				}
			}
		}
		console.log('slots', slots);

		await RestaurantTimeLap.bulkCreate(slots);

		// DashboardCards work
		await RestaurantDashboardCard.destroy({
			where: {
				restaurantId: restaurant.id,
			},
		});

		let cards = data.dashboardCardIds;
		console.log('dashboardCards', data);
		dashboardCards = [];

		cards.map((card) => {
			dashboardCards.push({
				dashboardCardId: parseInt(card),
				restaurantId: restaurant.id,
			});
		});

		// console.log(dashboardCards)
		await RestaurantDashboardCard.bulkCreate(dashboardCards);

		// FoodType work
		await RestaurantType.destroy({
			where: {
				restaurantId: restaurant.id,
			},
		});

		let type = data.serviceCategories;

		let foodsType = await FoodType.findAll({
			where: {
				id: {
					[Op.in]: type,
				},
			},
		});
		let restaurantTypes = [];
		foodsType.map((typ) => {
			restaurantTypes.push({
				restaurantId: restaurant.id,
				name: typ.name,
			});
		});

		await RestaurantType.bulkCreate(restaurantTypes);

		// restaurant.restaurantMediaId = media.id;
		restaurant.restaurantProfileId = restaurantProfile.id;

		let deliveryRatesDataToInsert = []
		let deliveryRatesData = data.deliveryOption == 'rateViaOrderPrice' ? JSON.parse(data.deliveryRateViaOrderPrice) : JSON.parse(data.deliveryRateViaMiles)
		if (deliveryRatesData && deliveryRatesData.length) {

			deliveryRatesData.map(item => {
				if (data.deliveryOption == 'rateViaOrderPrice') {
					deliveryRatesDataToInsert.push({
						restaurantId: restaurant.id,
						type: data.deliveryOption,
						valueOver: item.orderPriceOver,
						deliveryCharges: item.deliveryCharges
					})
				} else {
					deliveryRatesDataToInsert.push({
						restaurantId: restaurant.id,
						type: data.deliveryOption,
						valueOver: item.milesOver,
						deliveryCharges: item.deliveryCharges
					})
				}
			})

			try {
				await DeliveryRates.destroy({
					where: {
						restaurantId: restaurant.id,
						type: data.deliveryOption
					}
				})
			} catch (error) {
				console.log('delivery rates bulk destroy catch ::', error);
			}


			try {
				await DeliveryRates.bulkCreate(deliveryRatesDataToInsert)
			} catch (error) {
				console.log('delivery rates bulk create catch ::', error);
			}

		}

		await restaurant.save();

		return callback(null, { data: "Restaurant created successfully" });
	} catch (error) {
		console.log(error);
		return callback({
			status: false,
			message: error.message,
		});
	}
};

exports.changeApprovedStatus = async function (call, callback) {
	try {
		let providerId = call.request.providerId;
		let restaurantName = call.request.restaurantName;
		let status = call.request.status;
		let restaurant = await Restaurant.findOne({
			where: {
				providerId: providerId,
				name: restaurantName,
			},
		});

		if (!restaurant) {
			return callback({
				status: false,
				message: "Restaurant not found",
			});
		}

		const ChangeUserStatus = (userId, status) => {
			return new Promise((resolve, reject) => {
				try {
					rpcClient?.UserService?.ChangeUserStatus({
						userId: userId,
						userStatus: status,
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
		if (status == 'accepted' || status == 'rejected')
			await ChangeUserStatus(restaurant.userId, status == 'accepted' ? 'active' : status);

		restaurant.status = status;

		await RestaurantFoodMenu.create({
			restaurantId: restaurant.id,
			name: 'Popular',
		})

		await restaurant.save();


		return callback(null, { status: true, data: "Restaurant updated successfully" });
	} catch (error) {
		console.log(error);
		return callback({
			status: false,
			message: error.message,
		});
	}
};

exports.changeRestaurantMediaExpiry = async function (call, callback) {
	try {
		let data = call.request.data;
		data = JSON.parse(data);
		// console.log('data in rpc=>', data)

		if (data.dataType === 'restaurant' && data.dataId) {

			let requestedData = await RestaurantApproval.findOne({ where: { id: data.dataId, status: 'pending' } })
			if (!requestedData) {
				return callback(null, { status: false, data: "restaurant request not found" });
			}
			requestedData.fields = JSON.parse(data.serviceDetails);
			await requestedData.save();
			// console.log('requestedData.fields=>', requestedData.fields)

		}

		let restaurantMedia = await RestaurantMedia.findOne({ where: { mediaType: data.mediaType, media: data.fileName } });

		if (restaurantMedia) {

			restaurantMedia.expiryDate = data.expiryDate;

			await restaurantMedia.save();

			return callback(null, { status: true, data: "Media expiry updated successfully" });
		}
		else {

			return callback(null, { status: false, data: "Media Document not found" });

		}

	} catch (error) {
		console.log(error);
		return callback({
			status: false,
			message: error.message,
		});
	}
}

exports.suspendRestaurants = async function (call, callback) {
	try {
		let id = call.request.id;
		let role = call.request.role;

		let whereClause = {}
		if (role === 'provider') {
			whereClause.provider = id
		}
		else {
			whereClause.userId = id
		}

		await Restaurant.update(
			{
				status: 'suspended'
			},
			{
				where: {
					...whereClause,
					deleteStatus: false,
					[Op.not]: {
						status: 'suspended',
					}
				}
			}
		)

		return callback(null, { status: true });

	} catch (error) {
		console.log(error);
		return callback({
			status: false,
			message: error.message,
		});
	}
}

exports.getRestaurantMedia = async function (call, callback) {
	try {
		let userId = call.request.userId;

		let restaurant = await Restaurant.findOne({
			where: {
				userId: userId,
			}
		})


		if (restaurant) {
			let restaurantMedia = await RestaurantMedia.findAll({
				where: {
					restaurantId: restaurant.id,
				}
			})
			return callback(null, {
				status: true,
				data: JSON.stringify(restaurantMedia)
			})
		}
		else {
			return callback(null, {
				status: false,
				data: 'restaurant not found'
			})
		}

	} catch (error) {
		console.log(error)
		return callback({
			message: error.message
		})
	}
}

//  Controller Methods
exports.getRestaurantApprovals = async function (req, res) {

	try {
		let user = req.user;

		let agentRoles = await general_helper.getAgentRoles();

		if (user.roleName !== "provider" && user.roleName !== "admin" && !agentRoles.includes(user.roleName)) {
			return respondWithError(req, res, 'invalid user request', null, 405)
		}

		let requestWhere = {}
		if (user.roleName === 'provider') {
			requestWhere.userId = user.id
		}
		let restaurantApprovals = await RestaurantApproval.findAll({
			where: {
				status: 'pending',
				...requestWhere,
			},
			order: [['id', 'desc']],
		})

		return respondWithSuccess(req, res, 'data fetched successfully', restaurantApprovals)
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null)
	}
	// next()
}

exports.changeRestaurantApproval = async function (req, res) {
	try {

		let user = req.user;

		let agentRoles = await general_helper.getAgentRoles();

		if (user.roleName !== "admin" && !agentRoles.includes(user.roleName)) {
			return respondWithError(req, res, 'invalid user request', null, 405)
		}

		const updateUser = (userId, restaurantName) => {
			return new Promise((resolve, reject) => {
				rpcClient.MainService.UpdateUser({
					userData: JSON.stringify({
						generatePass: true,
						userId: userId,
					}),
					restaurantName: restaurantName
				}, (error, updateUserResponse) => {
					if (error) {
						return reject(error)
					}
					return resolve(updateUserResponse)
				})
			})
		}

		// if (user.roleName !== 'admin') {
		// 	return res.status(400).send({ message: "Unauthorized Access" });
		// }

		let approvalId = req.body.approvalId;
		let status = req.body.status

		let approvalData = await RestaurantApproval.findOne({
			where: {
				id: approvalId
			}
		})

		if (!approvalData) {
			return res.status(400).send({
				message: "Approvals not found",
			})
		}

		let parsedApprovalData = JSON.parse(approvalData.fields);


		if (status == 'accepted') {
			try {

				if (!parsedApprovalData?.requiredData?.userId) {
					return respondWithError(req, res, '', null)
				}
				let responseRpc = await updateUser(parsedApprovalData.requiredData.userId, parsedApprovalData.requiredData.name)
				console.log(responseRpc)
			} catch (error) {
				console.log(error)
				return respondWithError(req, res, '', null)
			}

			await Restaurant.update({ status: 'active' }, { where: { id: approvalData.dataId } })
		} else if (status == 'rejected') {
			await Restaurant.update({ status: 'rejected' }, { where: { id: approvalData.dataId } })
		} else if (status == 'partially_rejected') {
			await Restaurant.update({ status: 'pending' }, { where: { id: approvalData.dataId } })
		}

		approvalData.status = status

		await RestaurantFoodMenu.create({
			restaurantId: approvalData.dataId,
			name: 'Popular',
		})

		await approvalData.save()


		let rpcRequestedData = {
			user: { id: approvalData.userId },
			status: status,
			rejectedFields: [],
		}

		rpcClient.MainService.BroadcastBranchAcceptRejectNotification({
			status: true,
			data: JSON.stringify(rpcRequestedData)
		}, async function (error, createBranchResponse) {
			if (error) {
				console.log('send notification rpc error', error);
			} else {
				console.log('send notification rpc response', createBranchResponse);
			}
		})

		if (status == 'rejected') {
			rpcClient.MainService.SendEmailByUserId({
				subject: 'Restaurant Request has been Rejected',
				userId: approvalData.userId,
				template: 'restaurant/restaurantRejected.pug',
			}, function (error, sendEmailResponse) {
				if (error) {
					console.log('send email rpc error', error);
				} else {
					console.log('send email rpc response', sendEmailResponse);
				}
			})
		}

		return res.status(200).send({
			message: 'Restaurant status updated successfully',
			data: approvalData
		});

	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null)
	}
}

exports.updateRestaurantRequestRejection = async function (req, res) {

	try {

		let payload = req.body.match

		let user = req.user;
		let agentRoles = await general_helper.getAgentRoles();

		if (user.roleName !== "admin" && !agentRoles.includes(user.roleName)) {
			return respondWithError(req, res, 'invalid user request', null, 405)
		}

		let restaurantApproval = await RestaurantApproval.findOne({ where: { id: payload.id, status: 'pending' } });
		if (!restaurantApproval)
			return respondWithError(req, res, 'restaurant request not found', null, 400)

		restaurantApproval.rejectedFields = payload.rejectedFields
		restaurantApproval.save();

		if (payload.rejectedFields && payload.rejectedFields.length > 0) {

			// let data = JSON.parse(restaurantApproval.fields);

			let rpcRequestedData = {
				user: { id: restaurantApproval.userId },
				status: 'rejected',
				rejectedFields: payload.rejectedFields,
			}

			rpcClient.MainService.BroadcastBranchAcceptRejectNotification({
				status: true,
				data: JSON.stringify(rpcRequestedData)
			}, async function (error, createBranchResponse) {
				if (error) {
					console.log('send notification rpc error', error);
				} else {
					console.log('send notification rpc response', createBranchResponse);
				}
			})

			rpcClient.MainService.SendEmailByUserId({
				subject: 'Some Data of Restaurant Request has been Rejected',
				userId: restaurantApproval.userId,
				template: 'restaurant/restaurantFieldsRejected.pug',
			}, function (error, sendEmailResponse) {
				if (error) {
					console.log('send email rpc error', error);
				} else {
					console.log('send email rpc response', sendEmailResponse);
				}
			})
		}

		return respondWithSuccess(req, res, 'restaurant rejections updated successfully', null)

	} catch (err) {
		console.log(err);
		return respondWithError(req, res, '', null)
	}

}

exports.getAll = async function (req, res) {
	let search = req.query.search;
	let filter = req.query.filter;
	let restaurantStatus = req.query.status ? req.query.status : null;
	let onlyRestaurantSearch = req.query.onlyRestaurantSearch
		? req.query.onlyRestaurantSearch
		: false;
	console.log("testFilter:", filter);

	let restaurantListTypeId = req.params.restaurantListTypeId;
	let dashboardCardId = req.query.dashboardCardId
		? req.query.dashboardCardId
		: 1;
	let foodType = req.query.foodType;
	let radius = req.query.radius ? req.query.radius : 5;
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
	let userRole = req.user?.roles[0]?.roleName;
	let dashboardCondition = {
		deleteStatus: false,
	};
	let dashboardSlug = "";

	let agentRoles = await general_helper.getAgentRoles();

	if (userRole !== "admin" && userRole !== "provider" && !agentRoles.includes(userRole)) {
		// console.log("check issues===========", dashboardCardId)
		dashboardCondition.id = dashboardCardId;
		let dashboardCardData = await DashboardCard.findOne({
			where: { id: dashboardCardId, deleteStatus: false },
		});
		if (!dashboardCardData) {
			return res.status(400).send({
				message: "Unable to fetch dashboard card.",
			});
		}
		dashboardSlug = dashboardCardData.slug;
	}
	// return res.send(restaurantListTypeId)
	RestaurantListType.findOne({
		where: {
			deleteStatus: false,
			slug: restaurantListTypeId,
		},
	})
		.then(async (item) => {
			if (item) {
				let lat = req.query.lat;
				let long = req.query.long;
				let restaurantWhere = {
					deleteStatus: false,
				};
				if ((userRole === "user" || userRole === "guest") && dashboardSlug !== "dine-in") {
					restaurantWhere.isOpen = true;
				}
				if (userRole !== "admin" && userRole !== "provider" && !agentRoles.includes(userRole)) {
					restaurantWhere.status = "active";
				} else {
					if (restaurantStatus) {
						restaurantWhere.status = restaurantStatus;
					}
				}

				if (userRole === "provider") {
					restaurantWhere.providerId = req.user.id;
				}

				if (item.slug !== "all") {
					restaurantWhere.listTypeId = item.id;
				}
				let restaurantTypeChecks = {
					required: false,
				};
				if (foodType) {
					let foodTypeList = foodType.split(",");
					if (foodTypeList && foodTypeList.length) {
						restaurantTypeChecks.where = {
							name: { [Op.in]: foodTypeList },
						};
						restaurantTypeChecks.required = true;
					}
				}
				let restaurantAdditionalOptions = {};
				if (lat && long && userRole !== "admin" && !agentRoles.includes(userRole)) {
					// console.log("itemmmmmm", item)
					let dataBaseDeliveryRadiusQuery = "<= deliveryRadius";
					restaurantAdditionalOptions.having = { isAvailableInDistance: true };
					if (dashboardSlug === "dine-in") {
						dataBaseDeliveryRadiusQuery = "";
						restaurantAdditionalOptions.having = {
							away_distance: { [Op.lte]: radius },
						};
					}
					if (dataBaseDeliveryRadiusQuery) {
						restaurantAdditionalOptions.attributes = {
							include: [
								[
									sequelize.literal(
										"acos( sin( radians( latitude ) ) * sin( radians( " +
										lat +
										" ) ) + cos( radians( latitude ) ) * cos( radians(" +
										lat +
										" )) * cos( radians( longitude ) - radians( " +
										long +
										" )) ) * 3963" +
										dataBaseDeliveryRadiusQuery
									),
									"isAvailableInDistance",
								],
								[
									sequelize.literal(
										"acos( sin( radians( latitude ) ) * sin( radians( " +
										lat +
										" ) ) + cos( radians( latitude ) ) * cos( radians(" +
										lat +
										" )) * cos( radians( longitude ) - radians( " +
										long +
										" )) ) * 3963"
									),
									"away_distance",
								],
							],
						};
					} else {
						restaurantAdditionalOptions.attributes = {
							include: [
								[
									sequelize.literal(
										"acos( sin( radians( latitude ) ) * sin( radians( " +
										lat +
										" ) ) + cos( radians( latitude ) ) * cos( radians(" +
										lat +
										" )) * cos( radians( longitude ) - radians( " +
										long +
										" )) ) * 3963" +
										dataBaseDeliveryRadiusQuery
									),
									"away_distance",
								],
							],
						};
					}
				}
				let responseData = await fetchRestaurants(
					restaurantAdditionalOptions,
					search,
					onlyRestaurantSearch,
					restaurantWhere,
					restaurantTypeChecks,
					dashboardCondition,
					dashboardCardId,
					req.user.id,
					pagination,
					restaurantListTypeId,
					null,
					lat,
					long
				);
				// if (search) {
				//     saveRecentSearch({ key: search, userId: req.user.id, location: 'restaurants' })
				// }
				// console.log('responseData:============', responseData)
				return res.send(responseData);
			} else {
				return res.status(400).send({
					message: "Unable to fetch restaurant list type.",
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

exports.getAllBranches = async function (req, res) {
	try {

		let agentRoles = await general_helper.getAgentRoles();

		if (req.user.roleName !== "admin" && req.user.roleName !== "provider" && !agentRoles.includes(req.user.roleName)) {
			return respondWithError(req, res, 'invalid user request!', null, 405)
		}

		let whereConditions = { status: 'active', deleteStatus: false }

		if (req.user.roles[0].roleName !== "provider") {

			if (!req.query.providerId) {
				return respondWithError(req, res, 'invalid data!', null, 400)
			}

			whereConditions.providerId = req.query.providerId

		} else {

			whereConditions.providerId = req.user.id

		}

		let data = await Restaurant.findAll({
			where: {
				...whereConditions
			},
			attributes: ["id", "name", "userId"]

		})

		return res.send({
			message: 'data fetched successfully.',
			data: data,
		});
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500)
	}
}

exports.getOne = async function (req, res) {
	try {
		let id = req.params.id;
		let restaurantListTypeId = req.params.restaurantListTypeId;

		let dashboardCardId = req.query.dashboardCardId ? req.query.dashboardCardId : 0;

		let dashboardCondition = {
			deleteStatus: false,
		};

		let dashboardSlug = "";

		let agentRoles = await general_helper.getAgentRoles();

		if (req.user.roleName !== "admin" && req.user.roleName !== "provider" && !agentRoles.includes(req.user.roleName)) {
			dashboardCondition.id = dashboardCardId;
			if (dashboardCardId === 0) {
				return res.status(422).send({
					message: "Invalid data.",
				});
			}
			let dashboardCardData = await DashboardCard.findOne({
				where: { id: dashboardCardId, deleteStatus: false },
			});
			if (!dashboardCardData) {
				return res.status(400).send({
					message: "Unable to fetch dashboard card.",
				});
			}
			dashboardSlug = dashboardCardData.slug;
		}

		let lat = req.query.lat;
		let long = req.query.long;
		let userRole = req.user.roles[0].roleName;
		RestaurantListType.findOne({
			where: {
				deleteStatus: false,
				slug: restaurantListTypeId,
			},
		}).then((item) => {
			if (!item) {
				return res.status(400).send({
					message: "Unable to fetch restaurant list type.",
				});
			}

			let where = {
				id: id,
				deleteStatus: false,
			};
			if (req.user.roles[0].roleName === "provider") {
				where.providerId = req.user.id;
			}
			if (item.slug !== "all") {
				where.listTypeId = item.id;
			}

			if (userRole === "user" && dashboardSlug !== "dine-in") {
				where.isOpen = true;
			}

			if (userRole !== "admin" && userRole !== "provider" && !agentRoles.includes(userRole)) {
				where.status = "active";
			}

			Restaurant.findOne({
				where: where,
				include: [
					{
						model: RestaurantType,
						attributes: ["id", "name"],
						required: false,
					},
					{
						model: RestaurantTiming,
						where: {
							deleteStatus: false,
						},
						include: [
							{
								model: RestaurantTimeLap,
								as: "restaurant_time_laps",
								attributes: ["id", "from", "to"],
							},
						],
						required: false,
						attributes: ["id", "day"],
					},
					{
						model: Favourite,
						where: {
							dashboardCardId: dashboardCardId,
							userId: req.user.id,
						},
						attributes: ["id"],
						required: false,
					},
					{
						model: DashboardCard,
						where: dashboardCondition,
						attributes: ["id", "name", "slug"],
						as: "dashboardCard",
					},
				],
				order: [
					[
						RestaurantTiming,
						[
							Sequelize.literal(
								"day='Sunday',day='Saturday',day='Friday',day='Thursday',day='Wednesday',day='Tuesday',day='Monday'"
							),
						],
					],
				],
			}).then(async (restaurant) => {
				if (!restaurant) {
					return res.status(200).send({
						message: "Unable to fetch data.",
						data: {},
					});
				}

				let record = restaurant.toJSON();
				let deliveryRates = []
				try {
					if (record?.deliveryOption && record?.id) {
						deliveryRates = await DeliveryRates.findAll({
							where: {
								restaurantId: record.id,
								type: record.deliveryOption,
							},
							raw: true
						})
					}
				} catch (error) {
					console.log(error);
				}
				record.deliveryRates = deliveryRates

				let restaurantApproval = await RestaurantApproval.findOne({
					where: {
						dataId: record.id
					}
				})

				record.restaurantApproval = restaurantApproval

				let reviewRecord = await Review.findOne({
					where: {
						restaurantId: record.id,
					},
					attributes: [
						[sequelize.fn("AVG", sequelize.col("foodStars")), "rating"],
						[sequelize.fn("count", sequelize.col("id")), "total_ratings"],
					],
				});


				reviewRecord = reviewRecord.toJSON();
				record.rating = reviewRecord.rating ? Number(Number(reviewRecord.rating).toFixed(2)) : 0.0;
				record.total_ratings = reviewRecord.total_ratings ? Number(reviewRecord.total_ratings) : 0;

				delete record.favourites;
				if (restaurant.favourites && restaurant.favourites.length) {
					record.is_favourite = true;
				} else {
					record.is_favourite = false;
				}

				if (lat & long) {
					let distance = general_helper.getDistanceFromLatLonInKm(lat, long, record.latitude, record.longitude);
					let distanceRoundValue = parseFloat(distance).toFixed(1);
					if (parseFloat(distanceRoundValue) < 0.05) {
						distanceRoundValue = "50 m";
					} else if (Number(distanceRoundValue) < 1) {
						distanceRoundValue = distanceRoundValue * 1000 + " m";
					} else {
						distanceRoundValue = distanceRoundValue + " miles";
					}

					record.away_distance = distanceRoundValue;
				}
				let restaurant_medias = await RestaurantMedia.findAll({ where: { restaurantId: id } })

				if (restaurant_medias.length) {


					let restaurantMedia = restaurant_medias.filter(mediaId => mediaId.restaurantId === record.id)
					if (restaurantMedia && restaurantMedia.length) {

						let logoMedia = []
						let bannerMedia = []
						let proofOfOwnershipMedia = []
						let menuMedia = []
						let alcoholLicenseMedia = []
						let photoOfShopFront = []
						let proofOfOwnershipExpiryDate = ''
						let alcoholLicenseExpiryDate = ''
						for (let i = 0; i < restaurantMedia.length; i++) {
							if (restaurantMedia[i].mediaType == 'logo') {
								if (restaurantMedia[i].media != '') {
									logoMedia.push(restaurantMedia[i].media)
								}
							}
							else if (restaurantMedia[i].mediaType == 'banner') {
								if (restaurantMedia[i].media != '') {
									bannerMedia.push(restaurantMedia[i].media)
								}
							}
							else if (restaurantMedia[i].mediaType == 'proofOfOwnership') {
								if (restaurantMedia[i].media != '') {
									proofOfOwnershipMedia.push(restaurantMedia[i].media)
								}
								if (restaurantMedia[i].expiryDate) {
									proofOfOwnershipExpiryDate = restaurantMedia[i].expiryDate
								}
							}
							else if (restaurantMedia[i].mediaType == 'menu') {
								if (restaurantMedia[i].media != '') {
									menuMedia.push(restaurantMedia[i].media)
								}
							}
							else if (restaurantMedia[i].mediaType == 'alcoholLicense') {
								if (restaurantMedia[i].media != '') {
									alcoholLicenseMedia.push(restaurantMedia[i].media)
								}
								if (restaurantMedia[i].expiryDate) {
									alcoholLicenseExpiryDate = restaurantMedia[i].expiryDate
								}
							}
							else if (restaurantMedia[i].mediaType == 'photoOfShopFront') {
								if (restaurantMedia[i].media != '') {
									photoOfShopFront.push(restaurantMedia[i].media)
								}
							}
						}
						let restaurantMediaObject = {
							['logo']: logoMedia,
							['banner']: bannerMedia,
							['proofOfOwnership']: proofOfOwnershipMedia,
							['menu']: menuMedia,
							['alcoholLicense']: alcoholLicenseMedia,
							['photoOfShopFront']: photoOfShopFront,
						}
						record.restaurant_medias = restaurantMediaObject
						record.media = restaurant_medias
						record.proofOfOwnershipExpiryDate = proofOfOwnershipExpiryDate
						record.alcoholLicenseExpiryDate = alcoholLicenseExpiryDate
						// console.log('item', item);
					}


				}

				// get restaurant User info
				rpcClient.UserService.GetUsers({ ids: [restaurant.userId, restaurant.providerId] }, function (err, usersData) {
					if (err) {
						console.log(err);
						return res.status(500).send({
							message: "Unable to get users this time.",
						});
					}

					usersData = usersData ? JSON.parse(usersData.data) : [];

					let user = usersData.find(a => a.roles[0].roleName === 'restaurant')
					record.user = user ? user : null
					let provider = usersData.find(a => a.roles[0].roleName === 'provider')
					record.provider = provider ? provider : null

					return res.send({
						message: "Data fetched successfully.",
						data: record,
					});
				})


			}).catch((err) => {
				console.log(err);
				return res.status(500).send({
					message: "Internal Server Error.",
				});
			});

		}).catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
	} catch (error) {
		console.log(error)
		return respondWithError(req, res, '', null, 500);
	}
};

exports.addRestaurant = async function (req, res) {
	const sequelizeTransaction = await sequelize_conn.transaction();
	try {
		/**
		 * @pending should be transactional
		*/

		let user = req.user;

		let listTypeId = req.body.listTypeId
		let dashboardCardIds = req.body.dashboardCardIds

		if (!dashboardCardIds || !dashboardCardIds.length) {
			return res.status(422).send({
				message: 'Invalid Data.',
			})
		}

		let restaurantListWhere = {
			deleteStatus: false
		}
		if (listTypeId) {
			restaurantListWhere.id = listTypeId
		} else {
			restaurantListWhere.slug = 'all'
		}


		let allListType = await RestaurantListType.findOne({ where: restaurantListWhere, transaction: sequelizeTransaction })
		if (!allListType) {
			sequelizeTransaction.rollback()
			return res.status(400).send({
				message: 'Unable to find all restaurant list type data.',
			})
		}

		// return
		let payload = {
			name: req.body.name,
			email: req.body.email,
			address: req.body.address,
			image: req.body.image ? req.body.image : '',
			coverImage: req.body.coverImage ? req.body.coverImage : '',
			deliveryCharges: req.body.deliveryCharges,
			deliveryTime: req.body.deliveryTime,
			deliveryRadius: req.body.deliveryRadius,
			longitude: req.body.longitude,
			latitude: req.body.latitude,
			vat: req.body.vat,
			vatNumber: req.body.vatNumber,
			isVat: req.body.isVat,
			roleId: req.user.roles[0].id ? req.user.roles[0].id : 1,
			listTypeId: allListType.id,
			currency: req.body.currency,
			currencySymbol: req.body.currencySymbol,
			country: req.body.countryId,
			state: req.body.stateId,
			city: req.body.cityId,
			providerId: user.id,
			minDeliveryOrderPrice: req.body.minDeliveryOrderPrice,
			deliveryRatePerMile: req.body.deliveryRatePerMile ? req.body.deliveryRatePerMile : 0,
			specialInstructions: req.body.specialInstructions ? req.body.specialInstructions : '',
			branchOwnRiders: req.body.branchOwnRiders ? req.body.branchOwnRiders : 0,
			branchOwnRidersCod: req.body.branchOwnRidersCod ? req.body.branchOwnRidersCod : 0,
			restaurantWebsiteLink: req.body.restaurantLink ? req.body.restaurantLink : "",
			deliveryOption: req.body.deliveryOption

		}

		let restaurantProfileData = {
			capacity: req.body.sittingCapacity,
			menuLink: req.body.menuLink && req.body.menuLink != '' ? req.body.menuLink : null,
			fsaLink: req.body.fsaLink && req.body.fsaLink != '' ? req.body.fsaLink : null,
			fsaStatus: req.body.fsaStatus,
			fsaId: req.body.fsaId,
			postCode: req.body.postCode,
			minDeliveryOrderPrice: req.body.minDeliveryOrderPrice,
			deliveryCharges: req.body.deliveryCharges,
			deliveryRadius: req.body.deliveryRadius,
			currency: req.body.currency,
			currencySymbol: req.body.currencySymbol,
			vat: req.body.vat,
			deliveryTime: req.body.deliveryTime,
			city: req.body.cityId,
		}



		rpcClient.MainService.CreateUser({
			name: payload.name,
			phoneNumber: req.body.phoneNumber,
			email: req.body.email,
			roleName: 'restaurant',
			parentId: payload.providerId
		}, async function (error, restaurantUserResponse) {
			if (error) {
				console.log(error);

				sequelizeTransaction.rollback()
				return res.status(500).send({
					message: `ERROR: ${error.message}`,
				})
			}

			try {

				let restaurantUserData = JSON.parse(restaurantUserResponse.data)
				payload.userId = restaurantUserData.id
				// add approval data here
				let branchBankAccountData = JSON.stringify({
					bankName: req.body.bankName,
					holderName: req.body.holderName,
					accountNumber: req.body.accountNumber,
					sortCode: req.body.sortCode,
					billingAddress: req.body.billingAddress,
					bankCityId: req.body.bankCityId,
					bankCountryId: req.body.bankCountryId,
					bankPostCode: req.body.bankPostCode,
					userId: restaurantUserData.id
				})

				await rpcClient.MainService.AddBranchBankAccountDetails({
					status: true,
					data: branchBankAccountData
				}, function (error, addBranchBankAccountDetailsResponse) {

					if (error) {
						console.log(error);

						sequelizeTransaction.rollback()
						return res.status(500).send({
							message: `ERROR: ${error.message}`,
						})
					}

				})

				let restaurantData = new Restaurant(payload)

				await restaurantData.save({ transaction: sequelizeTransaction })

				payload.id = restaurantData.id;

				let deliveryRatesDataToInsert = []
				let deliveryRatesData = payload.deliveryOption == 'rateViaOrderPrice' ? JSON.parse(req.body.deliveryRateViaOrderPrice) : JSON.parse(req.body.deliveryRateViaMiles)
				if (deliveryRatesData && deliveryRatesData.length) {

					deliveryRatesData.map(item => {
						if (payload.deliveryOption == 'rateViaOrderPrice') {
							deliveryRatesDataToInsert.push({
								restaurantId: payload.id,
								type: payload.deliveryOption,
								valueOver: item.valueOver ? item.valueOver : item.orderPriceOver,
								deliveryCharges: item.deliveryCharges
							})
						} else {
							deliveryRatesDataToInsert.push({
								restaurantId: payload.id,
								type: payload.deliveryOption,
								valueOver: item.valueOver ? item.valueOver : item.milesOver,
								deliveryCharges: item.deliveryCharges
							})
						}
					})

					try {
						await DeliveryRates.destroy({
							where: {
								restaurantId: payload.id,
								type: payload.deliveryOption
							}
						})
					} catch (error) {
						console.log('delivery rates bulk destroy catch ::', error);
					}


					try {
						await DeliveryRates.bulkCreate(deliveryRatesDataToInsert)
					} catch (error) {
						console.log('delivery rates bulk create catch ::', error);
					}

				}

				restaurantProfileData.restaurantId = restaurantData.id
				let restaurantProfile = new RestaurantProfile(restaurantProfileData)

				await restaurantProfile.save({ transaction: sequelizeTransaction })

				// image: req.body.image ? req.body.image : '',
				// coverImage: req.body.coverImage ? req.body.coverImage : '',
				// menu: req.body.menu ? Array.isArray(req.body.menu) ? JSON.stringify(req.body.menu) : req.body.menu : '',
				// alcoholLicense: req.body.alcoholLicense ? Array.isArray(req.body.alcoholLicense) ? JSON.stringify(req.body.alcoholLicense) : req.body.alcoholLicense : '',
				// proofOfOwnership: req.body.proofOfOwnership ? Array.isArray(req.body.proofOfOwnership) ? JSON.stringify(req.body.proofOfOwnership) : req.body.proofOfOwnership : '',

				let restaurantMedia = [
					{
						restaurantId: restaurantData.id,
						mediaType: 'logo',
						media: req.body.image,
					},
					{
						restaurantId: restaurantData.id,
						mediaType: 'banner',
						media: req.body.coverImage,
					},
					{
						restaurantId: restaurantData.id,
						mediaType: 'photoOfShopFront',
						media: req.body.photoOfShopFront,
					}
				]


				if (req.body.menu && Array.isArray(req.body.menu)) {
					for (let i = 0; i < req.body.menu.length; i++) {
						restaurantMedia.push(
							{
								restaurantId: restaurantData.id,
								mediaType: 'menu',
								media: req.body.menu[i]
							}
						)
					}
				} else if (checkValue(req.body.menu) != 'N/A') {
					restaurantMedia.push({
						restaurantId: restaurantData.id,
						mediaType: 'menu',
						media: req.body.menu
					})
				}


				if (req.body.alcoholLicense && Array.isArray(req.body.alcoholLicense)) {
					for (let i = 0; i < req.body.alcoholLicense.length; i++) {
						restaurantMedia.push(
							{
								restaurantId: restaurantData.id,
								mediaType: 'alcoholLicense',
								media: req.body.alcoholLicense[i]
							}
						)
					}
				} else if (checkValue(req.body.alcoholLicense) != 'N/A') {
					restaurantMedia.push({
						restaurantId: restaurantData.id,
						mediaType: 'alcoholLicense',
						media: req.body.alcoholLicense
					})
				}


				if (req.body.proofOfOwnership && Array.isArray(req.body.proofOfOwnership)) {
					for (let i = 0; i < req.body.proofOfOwnership.length; i++) {
						restaurantMedia.push(
							{
								restaurantId: restaurantData.id,
								mediaType: 'proofOfOwnership',
								media: req.body.proofOfOwnership[i]
							}
						)
					}
				} else if (checkValue(req.body.proofOfOwnership) != 'N/A') {
					restaurantMedia.push({
						restaurantId: restaurantData.id,
						mediaType: 'proofOfOwnership',
						media: req.body.proofOfOwnership
					})
				}

				let restaurant_medias = await RestaurantMedia.bulkCreate(restaurantMedia, { transaction: sequelizeTransaction })
				let requiredData = restaurantData.toJSON()
				requiredData.deliveryRatesData = JSON.stringify(deliveryRatesDataToInsert)
				requiredData.bankName = req.body.bankName
				requiredData.holderName = req.body.holderName
				requiredData.accountNumber = req.body.accountNumber
				requiredData.sortCode = req.body.sortCode
				requiredData.billingAddress = req.body.billingAddress
				requiredData.bankCityId = req.body.bankCityId
				requiredData.bankCountryId = req.body.bankCountryId
				requiredData.bankPostCode = req.body.bankPostCode


				if (restaurant_medias.length) {


					let restaurantMedia = restaurant_medias.filter(mediaId => mediaId.restaurantId === restaurantData.id)
					if (restaurantMedia && restaurantMedia.length) {

						let logoMedia = []
						let bannerMedia = []
						let proofOfOwnershipMedia = []
						let menuMedia = []
						let alcoholLicenseMedia = []
						let photoOfShopFront = []
						let logoMediaWithExpiry = []
						let bannerMediaWithExpiry = []
						let proofOfOwnershipMediaWithExpiry = []
						let menuMediaWithExpiry = []
						let alcoholLicenseMediaWithExpiry = []
						let photoOfShopFrontWithExpiry = []
						for (let i = 0; i < restaurantMedia.length; i++) {
							if (restaurantMedia[i].mediaType == 'logo') {
								if (restaurantMedia[i].media != '') {
									logoMedia.push(restaurantMedia[i].media)
									logoMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })
								}
							}
							else if (restaurantMedia[i].mediaType == 'banner') {
								if (restaurantMedia[i].media != '') {
									bannerMedia.push(restaurantMedia[i].media)
									bannerMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

								}
							}
							else if (restaurantMedia[i].mediaType == 'proofOfOwnership') {
								if (restaurantMedia[i].media != '') {
									proofOfOwnershipMedia.push(restaurantMedia[i].media)
									proofOfOwnershipMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })
								}
							}
							else if (restaurantMedia[i].mediaType == 'menu') {
								if (restaurantMedia[i].media != '') {
									menuMedia.push(restaurantMedia[i].media)
									menuMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

								}
							}
							else if (restaurantMedia[i].mediaType == 'alcoholLicense') {
								if (restaurantMedia[i].media != '') {
									alcoholLicenseMedia.push(restaurantMedia[i].media)
									alcoholLicenseMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

								}
							}
							else if (restaurantMedia[i].mediaType == 'photoOfShopFront') {
								if (restaurantMedia[i].media != '') {
									photoOfShopFront.push(restaurantMedia[i].media)
									photoOfShopFrontWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })
								}
							}
						}
						let restaurantMediaObject = {
							['logo']: logoMedia,
							['banner']: bannerMedia,
							['proofOfOwnership']: proofOfOwnershipMedia,
							['menu']: menuMedia,
							['alcoholLicense']: alcoholLicenseMedia,
							['photoOfShopFront']: photoOfShopFront
						}
						let restaurantMediaWithExpiryObject = {
							['logo']: logoMediaWithExpiry,
							['banner']: bannerMediaWithExpiry,
							['proofOfOwnership']: proofOfOwnershipMediaWithExpiry,
							['menu']: menuMediaWithExpiry,
							['alcoholLicense']: alcoholLicenseMediaWithExpiry,
							['photoOfShopFront']: photoOfShopFrontWithExpiry
						}
						requiredData.restaurant_medias = restaurantMediaObject
						requiredData.media = restaurantMediaWithExpiryObject
						// console.log('item', item);
					}
				}

				let types = []

				// requiredData.restaurant_medias = restaurantMedia
				requiredData.restaurantProfile = restaurantProfile.toJSON()
				requiredData.cuisine_types = []
				if (Array.isArray(req.body.restaurant_types)) {
					types = req.body.restaurant_types
				} else {
					types = general_helper.IsValidJSONString(req.body.restaurant_types)
				}

				if (types && types.length) {
					for (let i = 0; i < types.length; i++) {
						await RestaurantType.create({ name: types[i], restaurantId: restaurantData.id }, { transaction: sequelizeTransaction })
						requiredData.cuisine_types.push({ name: types[i] })
					}
				}

				restaurantData.addDashboardCard(dashboardCardIds);
				requiredData.dashboardCardIds = dashboardCardIds
				payload.id = restaurantData.id;


				let restaurantApproval = await RestaurantApproval.create({
					userId: req.user.id,
					dataId: restaurantData.id,
					model: 'Restaurant',
					action: 'addRestaurant',
					fields: {
						requiredData,
						user: restaurantUserData
					}
				}, {
					transaction: sequelizeTransaction
				})

				rpcClient.MainService.BroadcastBranchRegistrationNotification({
					status: true,
					data: JSON.stringify({
						serviceData: restaurantApproval,
						status: 'new'
					})
				}, async function (error, createBranchResponse) {
					console.log('notification error', error, createBranchResponse)


				})

				rpcClient.MainService.SendEmail({
					subject: 'Branch registered Successfully',
					to: user.email,
					template: 'restaurant/restaurantSubmitted.pug'
				}, function (error, sendEmailResponse) {
					console.log('email error', error, sendEmailResponse)
				})
				sequelizeTransaction.commit();

				return res.send({
					message: 'Restaurant has been added successfully.',
					data: requiredData
				})

			} catch (error) {
				console.log(error);
				sequelizeTransaction.rollback()
				return respondWithError(req, res, '', null, 500)
			}
		})
	} catch (error) {
		console.log(error)
		sequelizeTransaction.rollback()
		return respondWithError(req, res, '', null, 500)
	}
}

exports.edit = async function (req, res) {
	let data = req.body.match;

	// cards = cards.map((card) => {
	//     return { dashboardCardId: card, restaurantId: el.id }
	// })
	// RestaurantDashboardCard.bulkCreate(cards)
	// return res.send(data);

	Restaurant.findOne({
		where: {
			id: data.id,
		},
		include: [
			{ model: RestaurantType },
			{
				model: DashboardCard,
				as: "dashboardCard",
			},
		],
	}).then(async (item) => {
		if (item) {
			RestaurantDashboardCard.findAll({
				where: {
					restaurantId: item.id,
				},
				attributes: ["dashboardCardId"],
			}).then((vl) => {
				vl = vl.map((el) => {
					return el.dashboardCardId;
				});
				item.removeDashboardCard(vl);
			});

			item.addDashboardCard(data.servicesIds);
			item
				.update({
					name: data.name,
					isOpen: data.isOpen,
					longitude: data.longitude,
					latitude: data.latitude,
					vat: data.vat,
					deliveryTime: data.deliveryTime,
					deliveryCharges: data.deliveryCharges,
					deliveryRadius: data.deliveryRadius,
					currency: data.currency,
					currencySymbol: data.currencySymbol,
					priceBracket: data.priceBracket,
					country: data.country,
					minDeliveryOrderPrice: data.minDeliveryOrderPrice,
					address: data.street,
				})
				.then(async (rest) => {
					if (rest) {
						let profile = {
							companyName: data.companyName,
							capacity: data.capacity,
							postCode: data.postCode,
							menuLink: data.menuLink,
							fssFsaId: data.fssFsaId,
							fssFsaLink: data.fssFsaLink,
							fssFsaStatus: data.fssFsaStatus,
							vat: data.vat,
							deliveryTime: data.deliveryTime,
							deliveryCharges: data.deliveryCharges,
							deliveryRadius: data.deliveryRadius,
							currency: data.currency,
							currencySymbol: data.currencySymbol,
							priceBracket: data.priceBracket,
							street: data.street,
							countryId: data.countryId,
							minDeliveryOrderPrice: data.minDeliveryOrderPrice,
						};
						RestaurantProfile.update(profile, {
							where: {
								id: rest.restaurantProfileId,
							},
						});

						RestaurantMedia.update(
							{
								license: data.license,
								menuImage: data.menuImage,
								alcoholLicense: data.alcoholLicense,
								image: data.logo,
								coverImage: data.coverImage,
							},
							{
								where: {
									id: rest.restaurantMediaId,
								},
							}
						);
						let types = rest.restaurant_types;
						// if (types && types.length > 0) {
						let payloadTypes = data.types;

						let findItems = types.map((el) => {
							return el.id;
						});

						RestaurantType.destroy({
							where: {
								id: findItems,
							},
						});

						let assigTypes = payloadTypes.map((el) => {
							let val = {};

							val.name = el;
							val.restaurantId = rest.id;
							return val;
						});

						RestaurantType.bulkCreate(assigTypes);
						return res.send(rest);
					}
				});
		}
	});
};

exports.editBySuperAdmin = async function (req, res) {
	try {
		let updateData = {
			address: req.body.address,
			latitude: req.body.latitude,
			longitude: req.body.longitude
		}

		await Restaurant.update(updateData, { where: { id: req.body.id } })

		return respondWithSuccess(req, res, 'data updated successfully', null);
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500);
	}
}

exports.update = async function (req, res) {
	console.log('req.body =>', req.body);
	let listTypeId = req.body.listTypeId;
	let restaurantId = req.body.id
	let dashboardCardIds = req.body.dashboardCardIds;

	let agentRoles = await general_helper.getAgentRoles();

	if (!dashboardCardIds || !dashboardCardIds.length) {
		return res.status(422).send({
			message: "Invalid Data.",
		});
	}

	let where = {
		id: listTypeId,
		deleteStatus: false,
	};
	if (!listTypeId) {
		where = {
			slug: "all",
			deleteStatus: false,
		};
	}

	let allListType = await RestaurantListType.findOne({ where: where });
	if (allListType) {
		listTypeId = allListType.id;
	} else {
		return res.status(400).send({
			message: "Unable to find all restaurant list type data.",
		});
	}

	let updateData = {
		name: req.body.name,
		address: req.body.address,
		deliveryCharges: req.body.deliveryCharges,
		deliveryTime: req.body.deliveryTime,
		deliveryRadius: req.body.deliveryRadius,
		// isFeatured: req.body.isFeatured,
		// isTopPartner: req.body.isTopPartner,
		longitude: req.body.longitude,
		latitude: req.body.latitude,
		// userId: req.user.id,
		// roleId: req.user.roleId ? req.user.roleId : 1,
		listTypeId: listTypeId,
		currency: req.body.currency,
		currencySymbol: req.body.currencySymbol,
		country: req.body.countryId,
		state: req.body.stateId,
		city: req.body.cityId,
		minDeliveryOrderPrice: req.body.minDeliveryOrderPrice,
		deliveryRatePerMile: req.body.deliveryRatePerMile ? req.body.deliveryRatePerMile : 0,
		vat: req.body.vat,
		vatNumber: req.body.vatNumber,
		isVat: req.body.isVat,
		specialInstructions: req.body.specialInstructions ? req.body.specialInstructions : '',
		branchOwnRiders: req.body.branchOwnRiders ? req.body.branchOwnRiders : 0,
		branchOwnRidersCod: req.body.branchOwnRidersCod ? req.body.branchOwnRidersCod : 0,
		restaurantWebsiteLink: req.body.restaurantLink ? req.body.restaurantLink : '',
		deliveryOption: req.body.deliveryOption
	};

	if (req.user.roleName === 'admin' || agentRoles.includes(req.user.roleName)) {
		if (!req.body.vatNumber)
			delete updateData.vatNumber
		if (!req.body.isVat)
			delete updateData.isVat
		if (!req.body.specialInstructions)
			delete updateData.specialInstructions
	}

	if (checkValue(req.body.image) != 'N/A') {
		updateData.image = req.body.image
	}
	if (checkValue(req.body.coverImage) != 'N/A') {
		updateData.coverImage = req.body.coverImage
	}


	if (req.body.isOpen) {
		if (req.body.isOpen === false || req.body.isOpen === 'false' || req.body.isOpen === 0 || req.body.isOpen === '0')
			updateData.isOpen = 0;
		else
			updateData.isOpen = 1;
	}

	Restaurant.findOne({
		where: {
			[Op.and]: [
				{
					id: restaurantId,
				},
				{
					deleteStatus: false,
				},
			],
		},
		include: [
			{
				model: RestaurantType,
				required: false,
			},
		],
	}).then(async (restaurantData) => {
		if (restaurantData) {
			Restaurant.update(updateData, {
				where: {
					[Op.and]: [
						{
							id: restaurantId,
						},
						{
							deleteStatus: false,
						},
					],
				},
			}).then(async (data) => {
				if (data && data[0]) {

					let restaurant_dashboard_cards =
						await restaurantData.getDashboardCard();

					if (dashboardCardIds && dashboardCardIds.length) {
						if (
							restaurant_dashboard_cards &&
							restaurant_dashboard_cards.length
						) {
							restaurant_dashboard_cards.map((item) => {
								if (dashboardCardIds.includes(item.id)) {
									dashboardCardIds = dashboardCardIds.filter(
										(item) => item != item.dashboardCardId
									);
								} else {
									restaurantData.removeDashboardCard(item.id);
								}
							});
						}
						restaurantData.addDashboardCard(dashboardCardIds);
					} else {
						restaurantData.removeDashboardCards();
					}

					for (let i = 0; i < restaurantData.restaurant_types.length; i++) {
						restaurantData.restaurant_types[i].destroy();
					}

					let types = [];
					if (Array.isArray(req.body.restaurant_types)) {
						types = req.body.restaurant_types;
					} else {
						types = general_helper.IsValidJSONString(
							req.body.restaurant_types
						);
					}

					if (types && types.length) {
						for (let i = 0; i < types.length; i++) {
							await RestaurantType.create({
								name: types[i],
								restaurantId: restaurantId,
							});
						}
					}

					let restaurantProfile = await RestaurantProfile.findOne({
						where: {
							restaurantId: restaurantData.id,
						},
					});

					if (!restaurantProfile) {
						restaurantProfile = new RestaurantProfile({
							restaurantId: restaurantData.id,
						});
					}
					restaurantProfile.capacity = req.body.sittingCapacity ? req.body.sittingCapacity : restaurantProfile.capacity;
					restaurantProfile.menuLink = req.body.menuLink && req.body.menuLink != '' ? req.body.menuLink : restaurantProfile.menuLink;
					restaurantProfile.fsaLink = req.body.fsaLink && req.body.fsaLink != '' ? req.body.fsaLink : restaurantProfile.fsaLink;
					restaurantProfile.fsaStatus = req.body.fsaStatus ? req.body.fsaStatus : restaurantProfile.fsaStatus;
					restaurantProfile.fsaId = req.body.fsaId ? req.body.fsaId : restaurantProfile.fsaId;
					restaurantProfile.postCode = req.body.postCode ? req.body.postCode : restaurantProfile.postCode;

					restaurantProfile.minDeliveryOrderPrice = req.body.minDeliveryOrderPrice ? req.body.minDeliveryOrderPrice : restaurantProfile.minDeliveryOrderPrice
					restaurantProfile.deliveryCharges = req.body.deliveryCharges ? req.body.deliveryCharges : restaurantProfile.deliveryCharges
					restaurantProfile.deliveryRadius = req.body.deliveryRadius ? req.body.deliveryRadius : restaurantProfile.deliveryRadius
					restaurantProfile.currency = req.body.currency ? req.body.currency : restaurantProfile.currency
					restaurantProfile.currencySymbol = req.body.currencySymbol ? req.body.currencySymbol : restaurantProfile.currencySymbol
					restaurantProfile.vat = req.body.vat ? req.body.vat : restaurantProfile.vat
					restaurantProfile.deliveryTime = req.body.deliveryTime ? req.body.deliveryTime : restaurantProfile.deliveryTime
					restaurantProfile.city = req.body.cityId ? req.body.cityId : restaurantProfile.cityId

					await restaurantProfile.save();


					let deliveryRatesDataToInsert = []
					let deliveryRatesData = req.body.deliveryOption == 'rateViaOrderPrice' ? JSON.parse(req.body.deliveryRateViaOrderPrice) : JSON.parse(req.body.deliveryRateViaMiles)
					if (deliveryRatesData && deliveryRatesData.length) {

						deliveryRatesData.map(item => {
							if (req.body.deliveryOption == 'rateViaOrderPrice') {
								deliveryRatesDataToInsert.push({
									restaurantId: req.body.id,
									type: req.body.deliveryOption,
									valueOver: item.valueOver ? item.valueOver : item.orderPriceOver,
									deliveryCharges: item.deliveryCharges
								})
							} else {
								deliveryRatesDataToInsert.push({
									restaurantId: req.body.id,
									type: req.body.deliveryOption,
									valueOver: item.valueOver ? item.valueOver : item.milesOver,
									deliveryCharges: item.deliveryCharges
								})
							}
						})

						try {
							await DeliveryRates.destroy({
								where: {
									restaurantId: req.body.id,
									type: req.body.deliveryOption
								}
							})
						} catch (error) {
							console.log('delivery rates bulk destroy catch ::', error);
						}


						try {
							await DeliveryRates.bulkCreate(deliveryRatesDataToInsert)
						} catch (error) {
							console.log('delivery rates bulk create catch ::', error);
						}

					}



					let newData = await Restaurant.findOne({
						where: {
							[Op.and]: [
								{
									id: restaurantId,
								},
								{
									deleteStatus: false,
								},
							],
						},
						include: [
							{
								modal: RestaurantProfile,
								where: {
									restaurantId: restaurantId
								},
							}
						],
						include: [
							{
								model: Review,
								// attributes: ["id", "name"],
								// required: false,
								where: {
									id: restaurantId
								}
							},
						],
						include: [
							{
								model: RestaurantType,
								attributes: ["id", "name"],
								// ...restaurantTypeChecks,
							},
							{
								model: RestaurantTiming,
								where: {
									deleteStatus: false,
								},
								include: [
									{
										model: RestaurantTimeLap,
										as: "restaurant_time_laps",
										attributes: ["id", "from", "to"],
									},
								],
								required: false,
								attributes: ["id", "day"],
							},
							{
								model: DashboardCard,
								where: {
									id: { [Op.in]: dashboardCardIds }
								},
								attributes: ["id", "name", "slug"],
								as: "dashboardCard",
							},
							// {
							//   model: Favourite,
							//   where: {
							//     dashboardCardId: dashboardCardId,
							//     userId: userId,
							//   },
							//   attributes: ["id"],
							//   required: false,
							// },
						]

					});

					await RestaurantMedia.destroy({
						where: {
							restaurantId: restaurantData.id,
							// mediaType: {
							//   [Op.in]: ['menu', 'alcoholLicense', 'proofOfOwnership']
							// }
						}
					})

					let restaurantMedia = []


					if (checkValue(req.body.image) != 'N/A') {
						restaurantMedia.push(
							{
								restaurantId: restaurantId,
								mediaType: 'logo',
								media: req.body.image
							}
						)

					}

					if (checkValue(req.body.coverImage) != 'N/A') {
						restaurantMedia.push(
							{
								restaurantId: restaurantId,
								mediaType: 'banner',
								media: req.body.coverImage
							}
						)

					}

					if (checkValue(req.body.photoOfShopFront) != 'N/A') {
						restaurantMedia.push(
							{
								restaurantId: restaurantId,
								mediaType: 'photoOfShopFront',
								media: req.body.photoOfShopFront
							}
						)

					}

					if (req.body.restaurant_medias && Object.keys(req.body.restaurant_medias).length && IsValidJSONString(req.body.restaurant_medias.menu)) {
						let menuArray = JSON.parse(req.body.restaurant_medias.menu)
						if (menuArray && menuArray.length) {
							for (let i = 0; i < menuArray.length; i++) {
								restaurantMedia.push(
									{
										restaurantId: restaurantId,
										mediaType: 'menu',
										media: menuArray[i]
									}
								)
							}
						}
					}
					if (req.body.menu && Array.isArray(req.body.menu)) {
						for (let i = 0; i < req.body.menu.length; i++) {
							restaurantMedia.push(
								{
									restaurantId: restaurantId,
									mediaType: 'menu',
									media: req.body.menu[i]
								}
							)
						}
					}
					else if (checkValue(req.body.menu) != 'N/A') {

						restaurantMedia.push({
							restaurantId: restaurantId,
							mediaType: 'menu',
							media: req.body.menu
						})

					}

					if (req.body.restaurant_medias && Object.keys(req.body.restaurant_medias).length && IsValidJSONString(req.body.restaurant_medias.alcoholLicense)) {
						let alcoholLicenseArray = JSON.parse(req.body.restaurant_medias.alcoholLicense)
						if (alcoholLicenseArray && alcoholLicenseArray.length) {
							for (let i = 0; i < alcoholLicenseArray.length; i++) {
								restaurantMedia.push(
									{
										restaurantId: restaurantId,
										mediaType: 'alcoholLicense',
										media: alcoholLicenseArray[i]
									}
								)
							}
						}
					}
					if (req.body.alcoholLicense && Array.isArray(req.body.alcoholLicense)) {
						for (let i = 0; i < req.body.alcoholLicense.length; i++) {
							restaurantMedia.push(
								{
									restaurantId: restaurantId,
									mediaType: 'alcoholLicense',
									media: req.body.alcoholLicense[i]
								}
							)
						}
					} else if (checkValue(req.body.alcoholLicense) != 'N/A') {

						restaurantMedia.push({
							restaurantId: restaurantId,
							mediaType: 'alcoholLicense',
							media: req.body.alcoholLicense
						})

					}

					if (req.body.restaurant_medias && Object.keys(req.body.restaurant_medias).length && IsValidJSONString(req.body.restaurant_medias.proofOfOwnership)) {
						let proofOfOwnershipArray = JSON.parse(req.body.restaurant_medias.proofOfOwnership)
						if (proofOfOwnershipArray && proofOfOwnershipArray.length) {
							for (let i = 0; i < proofOfOwnershipArray.length; i++) {
								restaurantMedia.push(
									{
										restaurantId: restaurantId,
										mediaType: 'proofOfOwnership',
										media: proofOfOwnershipArray[i]
									}
								)
							}
						}
					}
					if (req.body.proofOfOwnership && Array.isArray(req.body.proofOfOwnership)) {
						for (let i = 0; i < req.body.proofOfOwnership.length; i++) {
							restaurantMedia.push(
								{
									restaurantId: restaurantId,
									mediaType: 'proofOfOwnership',
									media: req.body.proofOfOwnership[i]
								}
							)
						}
					} else if (checkValue(req.body.proofOfOwnership) != 'N/A') {

						restaurantMedia.push({
							restaurantId: restaurantId,
							mediaType: 'proofOfOwnership',
							media: req.body.proofOfOwnership
						})

					}

					await RestaurantMedia.bulkCreate(restaurantMedia)


					let responseData = newData.toJSON()
					// responseData.dashboardCard = dashboardCard

					let restaurant_medias = await RestaurantMedia.findAll({ where: { restaurantId: restaurantData.id } })

					if (restaurant_medias.length) {


						let restaurantMedia = restaurant_medias.filter(mediaId => mediaId.restaurantId === restaurantData.id)
						if (restaurantMedia && restaurantMedia.length) {

							let logoMedia = []
							let bannerMedia = []
							let proofOfOwnershipMedia = []
							let menuMedia = []
							let alcoholLicenseMedia = []
							let photoOfShopFront = []

							let logoMediaWithExpiry = []
							let bannerMediaWithExpiry = []
							let proofOfOwnershipMediaWithExpiry = []
							let menuMediaWithExpiry = []
							let alcoholLicenseMediaWithExpiry = []
							let photoOfShopFrontWithExpiry = []

							for (let i = 0; i < restaurantMedia.length; i++) {
								if (restaurantMedia[i].mediaType == 'logo') {
									if (restaurantMedia[i].media != '') {
										logoMedia.push(restaurantMedia[i].media)
										logoMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })
									}
								}
								else if (restaurantMedia[i].mediaType == 'banner') {
									if (restaurantMedia[i].media != '') {
										bannerMedia.push(restaurantMedia[i].media)
										bannerMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

									}
								}
								else if (restaurantMedia[i].mediaType == 'proofOfOwnership') {
									if (restaurantMedia[i].media != '') {
										proofOfOwnershipMedia.push(restaurantMedia[i].media)
										proofOfOwnershipMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

									}
								}
								else if (restaurantMedia[i].mediaType == 'menu') {
									if (restaurantMedia[i].media != '') {
										menuMedia.push(restaurantMedia[i].media)
										menuMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

									}
								}
								else if (restaurantMedia[i].mediaType == 'alcoholLicense') {
									if (restaurantMedia[i].media != '') {
										alcoholLicenseMedia.push(restaurantMedia[i].media)
										alcoholLicenseMediaWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

									}
								}
								else if (restaurantMedia[i].mediaType == 'photoOfShopFront') {
									if (restaurantMedia[i].media != '') {
										photoOfShopFront.push(restaurantMedia[i].media)
										photoOfShopFrontWithExpiry.push({ path: restaurantMedia[i].media, expiryDate: null })

									}
								}
							}
							let restaurantMediaObject = {
								['logo']: logoMedia,
								['banner']: bannerMedia,
								['proofOfOwnership']: proofOfOwnershipMedia,
								['menu']: menuMedia,
								['alcoholLicense']: alcoholLicenseMedia,
								['photoOfShopFront']: photoOfShopFront
							}

							let restaurantMediaWithExpiryObject = {
								['logo']: logoMediaWithExpiry,
								['banner']: bannerMediaWithExpiry,
								['proofOfOwnership']: proofOfOwnershipMediaWithExpiry,
								['menu']: menuMediaWithExpiry,
								['alcoholLicense']: alcoholLicenseMediaWithExpiry,
								['photoOfShopFront']: photoOfShopFrontWithExpiry
							}
							responseData.restaurant_medias = restaurantMediaObject
							responseData.media = restaurantMediaWithExpiryObject

						}
					}
					let reviewRecord = await Review.findOne({
						where: {
							restaurantId: restaurantId,
						},
						attributes: [
							[sequelize.fn("AVG", sequelize.col("foodStars")), "rating"],
							[sequelize.fn("count", sequelize.col("id")), "total_ratings"],
						],
					});

					reviewRecord = reviewRecord.toJSON();
					responseData.rating = reviewRecord.rating
						? Number(Number(reviewRecord.rating).toFixed(2))
						: 0.0;
					responseData.total_ratings = reviewRecord.total_ratings
						? Number(reviewRecord.total_ratings)
						: 0;
					responseData.ratingAndReviews = reviewRecord

					//get branch user data 
					// rpcClient.UserService.GetUsers({ ids: [responseData.userId] }, async function (err, usersData) {
					// 	if (err) {
					// 		console.log(err);
					// 		return res.status(500).send({
					// 			message: "Unable to get users this time.",
					// 		});
					// 	}
					// 	let user = {}
					// 	user = usersData ? JSON.parse(usersData.data)[0] : null;

					// 	let requiredData = { ...responseData }

					// 	let dashboardCardIds = requiredData.dashboardCard.map(item => item.id)

					// 	requiredData.dashboardCardIds = dashboardCardIds

					// 	requiredData.restaurantProfile = requiredData.restaurant_profile
					// 	requiredData.cuisine_types = requiredData.restaurant_types

					// 	let dataToUpdate = {
					// 		userId: req.user.id,
					// 		dataId: restaurantData.id,
					// 		model: 'Restaurant',
					// 		action: 'addRestaurant',
					// 		fields: {
					// 			requiredData,
					// 			user: user
					// 		}
					// 	}

					// 	if (req.body.rejectedFields) {
					// 		dataToUpdate.rejectedFields = null
					// 	}

					// 	await RestaurantApproval.update(dataToUpdate,
					// 		{
					// 			where: {
					// 				dataId: restaurantData.id
					// 			}
					// 		}
					// 	)
					// 	responseData.user = user
					// })

					const GetUsers = () => {
						return new Promise((resolve, reject) => {
							rpcClient.UserService.GetUsers({ ids: [responseData.userId] }, function (error, usersData) {
								if (error) {
									console.log(error);
									// return res.status(500).send({
									// 	message: "Unable to get users this time.",
									// });
									return reject(error)
								}
								return resolve(usersData)
							})
						})
					}

					let usersData = await GetUsers()

					let user = {}
					user = usersData ? JSON.parse(usersData.data)[0] : null;

					let branchBankAccountData = JSON.stringify({
						bankName: req.body.bankName,
						holderName: req.body.holderName,
						accountNumber: req.body.accountNumber,
						sortCode: req.body.sortCode,
						billingAddress: req.body.billingAddress,
						bankCityId: req.body.bankCityId,
						bankCountryId: req.body.bankCountryId,
						bankPostCode: req.body.bankPostCode,
						userId: user.id
					})

					await rpcClient.MainService.AddBranchBankAccountDetails({
						status: true,
						data: branchBankAccountData
					}, async function (error, addBranchBankAccountDetailsResponse) {

						if (error) {
							console.log(error);

							// sequelizeTransaction.rollback()
							return res.status(500).send({
								message: `ERROR: ${error.message}`,
							})
						}

						if (addBranchBankAccountDetailsResponse) {

							user.bank_account = JSON.parse(addBranchBankAccountDetailsResponse.data)

						}

						let requiredData = { ...responseData }

						requiredData.bankName = req.body.bankName
						requiredData.holderName = req.body.holderName
						requiredData.accountNumber = req.body.accountNumber
						requiredData.sortCode = req.body.sortCode
						requiredData.billingAddress = req.body.billingAddress
						requiredData.bankCityId = req.body.bankCityId
						requiredData.bankCountryId = req.body.bankCountryId
						requiredData.bankPostCode = req.body.bankPostCode


						let dashboardCardIdsArray = requiredData.dashboardCard.map(item => item.id)

						requiredData.dashboardCardIds = dashboardCardIdsArray

						requiredData.restaurantProfile = requiredData.restaurant_profile
						requiredData.cuisine_types = requiredData.restaurant_types
						requiredData.deliveryRatesData = JSON.stringify(deliveryRatesDataToInsert)

						let dataToUpdate = {
							userId: req.user.id,
							dataId: restaurantData.id,
							model: 'Restaurant',
							action: 'addRestaurant',
							fields: {
								requiredData,
								user: user
							}
						}

						if (req.body.rejectedFields) {
							dataToUpdate.rejectedFields = null
						}

						await RestaurantApproval.update(dataToUpdate,
							{
								where: {
									dataId: restaurantData.id
								}
							}
						)
						responseData.user = user


						let rpcData = {
							serviceData: dataToUpdate,
							status: 'update'
						}
						if (req.user.roleName !== 'admin' || !agentRoles.includes(req.user.roleName)) {
							rpcClient.MainService.BroadcastBranchRegistrationNotification({
								status: true,
								data: JSON.stringify(rpcData)
							}, async function (error, updateBranchResponse) {
								console.log('error, updateBranchResponse', error, updateBranchResponse);
								if (error) {
									return res.status(500).send({
										message: `ERROR: ${error.message}`,
									})
								}
							})
						}

						let deliveryRates = []
						try {
							if (req.body.deliveryOption && restaurantId) {
								deliveryRates = await DeliveryRates.findAll({
									where: {
										restaurantId: restaurantId,
										type: req.body.deliveryOption,
									},
									raw: true
								})
							}
						} catch (error) {
							console.log(error);
						}
						responseData.deliveryRates = deliveryRates

						console.log('responseData', responseData);
						return res.send({
							message: "Data has been updated successfully.",
							data: responseData,
						});




						// console.log('responseData before update =>', responseData);
						// return res.send({
						// 	message: "Data has been updated successfully.",
						// 	data: responseData,
						// });

					})


				} else {
					return res.status(400).send({
						message: "Unable to update Data.",
					});
				}
			}).catch((err) => {
				console.log(err);
				return res.status(500).send({
					message: "Internal Server Error.",
				});
			});
		} else {
			return res.status(400).send({
				message: "Unable to fetch restaurant. Restaurant not found.",
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

exports.delete = async function (req, res) {
	let id = req.params.id;

	Restaurant.update(
		{ deleteStatus: true },
		{
			where: {
				[Op.and]: [
					{
						deleteStatus: false,
					},
					{
						id: id,
					},
				],
			},
		}
	)
		.then((data) => {
			if (data && data[0]) {
				return res.send({
					message: "Restaurant has been deleted successfully.",
				});
			} else {
				return res.status(400).send({
					message: "Unable to delete restaurant. Restaurant not found.",
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

exports.openingStatus = async function (req, res) {
	try {
		/**
		 * 1. get timezone from user's current location
		 * 2.
		 */
		let id = req.body.id;
		console.log("===== Current Dates =====");

		let restaurant = await Restaurant.findOne({
			where: {
				id: id,
				deleteStatus: false,
				status: "active",
			},
		});

		if (!restaurant) {
			return res.status(400).send({
				status: false,
				message: "Error: Restaurant not found",
			});
		}

		let timezones = find(restaurant.latitude, restaurant.longitude);
		if (!timezones && !timezones.length) {
			return res.status(400).send({
				status: false,
				message: "Error: restaurant timezone not found",
			});
		}

		console.log("Restaurant Timezone:", timezones[0]);

		let currentDateTime = moment()
			.tz(timezones[0])
			.format(app_constants.TIMESTAMP_FORMAT);
		console.log("Current DateTime:", currentDateTime);

		let currentDate = moment(currentDateTime).format(app_constants.DATE_FORMAT);
		console.log("Current Date:", currentDate);

		let currentDay = moment(currentDateTime).format("dddd");
		console.log("Current Day:", currentDay);

		let currentTime = moment(currentDateTime).format("h:mm A");
		console.log("Current Time", currentTime);

		console.log("===== End Current Dates =====");

		console.log("");

		restaurant.restaurant_timings = await restaurant.getRestaurant_timings({
			where: {
				deleteStatus: false,
				day: currentDay,
			},
			include: [
				{
					model: RestaurantTimeLap,
					as: "restaurant_time_laps",
					attributes: ["id", "from", "to"],
				},
			],
			attributes: ["id", "day"],
		});

		let isOpen = req.body.isOpen && req.body.isOpen !== "false" ? true : false;
		console.log("restaurantIsOpen:", isOpen);

		if (isOpen) {
			let restaurantTimings = restaurant.restaurant_timings[0];
			if (!restaurantTimings) {
				console.log("case 1, restaurantTimings");
				return res.status(400).send({
					status: false,
					message: "Current time is not matched in restaurant timing",
				});
			}

			let restaurantTimeLaps =
				restaurant.restaurant_timings[0].restaurant_time_laps;
			if (!restaurantTimeLaps.length) {
				console.log("case 2, restaurantTimeLaps");
				return res.status(400).send({
					status: false,
					message: "Current time is not matched in restaurant timing",
				});
			}

			let isIncluded = false;
			let parsedCurrentTime = moment(currentTime, "h:mma");
			for (const timeLap of restaurantTimeLaps) {
				let to = moment(timeLap.to, "h:mma");
				let from = moment(timeLap.from, "h:mma");
				if (
					from.isBefore(parsedCurrentTime) &&
					parsedCurrentTime.isBefore(to)
				) {
					isIncluded = true;
					break;
				}
			}

			if (!isIncluded) {
				console.log("case 3, restaurantTimeLaps Time");
				return res.status(400).send({
					status: false,
					message: "Current time is not matched in restaurant timing",
				});
			}
		}

		let nextOpeningTime = null;
		let nextOpeningTimeType = null;
		if (!isOpen) {
			nextOpeningTime = req.body.nextOpeningTime;
			nextOpeningTimeType = req.body.nextOpeningType;
		}

		let restaurantUpdateData = {
			manualStatus: isOpen ? "opened" : "closed",
		};

		if (nextOpeningTimeType) {
			if (nextOpeningTimeType === "other") {
				if (nextOpeningTime < currentDateTime) {
					return res.status(422).send({
						message: "Next opening time is given in past",
					});
				}
				nextOpeningTime = moment(nextOpeningTime).format(
					app_constants.TIMESTAMP_FORMAT
				);
			} else if (nextOpeningTimeType === "rest_of_the_day") {
				nextOpeningTime = `${moment().format(app_constants.DATE_FORMAT)} 23:59`;
			} else if (nextOpeningTimeType === "indefinitely") {
				nextOpeningTime = null;
			} else {
				try {
					nextOpeningTime = moment(currentDateTime)
						.add(nextOpeningTime, nextOpeningTimeType)
						.format(app_constants.TIMESTAMP_FORMAT);
				} catch (error) {
					console.log(error);
					return res.stat(422).send({
						message: "Invalid value of next opening time or type",
					});
				}
			}
			console.log("nextOpeningTime:", nextOpeningTime);
			restaurantUpdateData.nextOpeningTime = nextOpeningTime;
		}
		console.log(restaurantUpdateData);
		// return res.send('test');

		await restaurant.update({ isOpen: isOpen, ...restaurantUpdateData });

		return res.send({
			message: isOpen
				? `Restaurant has been mark as opened successfully.`
				: `Restaurant has been mark as closed successfully.`,
		});
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500)
	}
};

exports.suspendStatus = async function (req, res) {
	try {
		let timezone = req.headers['timezone'];
		let id = req.body.id;
		let reason = req.body.reason;
		let isPermanent = req.body.isPermanent;
		let date = req.body.date;
		let role = req.user?.roles[0]?.roleName;

		let agentRoles = await general_helper.getAgentRoles();

		if (role !== 'admin' && role !== 'provider' && !agentRoles.includes(role)) {
			return res.status(401).send({
				status: false,
				message: "Unauthorized access",
			});
		}

		let restaurant = await Restaurant.findOne({
			where: {
				id: id,
				deleteStatus: false,
				status: "active",
			},
		});

		if (!restaurant) {
			return res.status(400).send({
				status: false,
				message: "Error: Restaurant not found",
			});
		}

		if (role == 'provider') {
			if (restaurant.providerId != req.user.id) {
				return res.status(401).send({
					status: false,
					message: "Unauthorized access",
				});
			}
		}


		let restaurantUpdateData = {
			status: 'suspended'
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

		if (isPermanent == false || isPermanent == 'false' || isPermanent == 0) {
			date = moment(date).format(app_constants.TIMESTAMP_FORMAT);
			date = moment.tz(date, timezone).utc().format(app_constants.TIMESTAMP_FORMAT);
			restaurantUpdateData.suspensionDate = date
		}

		await restaurant.update(restaurantUpdateData)

		let suspendData = {
			suspendedBy: 'super_admin',
			suspendSlug: 'superAdmin',
			suspendReason: reason,
		}

		await ChangeUserStatus(restaurant.userId, JSON.stringify(suspendData));

		// rpcClient.MainService.SendEmail({
		// 	subject: 'Restaurant Suspended',
		// 	// msg: '',
		// 	to: req.user.email,
		// 	template: 'business/accountSuspended.pug'
		// }, function (error, emailResponse) {

		// })
		return res.send({
			message: 'Restaurant has been mark as suspended successfully.'
		});
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500)
	}
}

exports.getUserRestaurant = async function (req, res) {
	let id = req.user.id;
	let where = {
		userId: id,
		deleteStatus: false,
	};
	try {
		Restaurant.findOne({
			where: where,
			include: [
				{
					model: RestaurantType,
					attributes: ["id", "name"],
					required: false,
				},
				{
					model: RestaurantTiming,
					where: {
						deleteStatus: false,
					},
					include: [
						{
							model: RestaurantTimeLap,
							as: "restaurant_time_laps",
							attributes: ["id", "from", "to"],
						},
					],
					required: false,
					attributes: ["id", "day"],
				},
			],
		})
			.then(async (data) => {
				if (data) {
					return res.send({
						message: "Data fetched successfully.",
						data: data,
					});
				} else {
					return res.status(200).send({
						message: "Unable to fetch data.",
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
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500)
	}
};

function fetchRestaurants(
	restaurantAdditionalOptions = {},
	search = null,
	onlyRestaurantSearch,
	restaurantWhere,
	restaurantTypeChecks,
	dashboardCondition,
	dashboardCardId,
	userId,
	pagination,
	restaurantListTypeId,
	idsDistance = null,
	lat = null,
	long = null
) {
	// console.log(dashboardCondition)
	return new Promise(async (resolve, reject) => {
		let restaurantIds = [];
		if (search) {
			if (!onlyRestaurantSearch) {
				let foodMenuIds = [];
				let products = await RestaurantMenuProduct.findAll({
					where: {
						name: {
							[Op.like]: `%${search}%`,
						},
						deleteStatus: false,
						isAvailable: true,
					},
					attributes: ["restaurantFoodMenuId"],
					limit: pagination.pageNo * pagination.limit,
				});

				if (products && products.length) {
					products.map((item) => foodMenuIds.push(item.restaurantFoodMenuId));
				}

				let foodMenuWhere = {
					name: {
						[Op.like]: `%${search}%`,
					},
					deleteStatus: false,
				};

				if (foodMenuIds) {
					foodMenuWhere = {
						[Op.or]: [
							{
								name: {
									[Op.like]: `%${search}%`,
								},
							},
							{
								id: { [Op.in]: foodMenuIds },
							},
						],
						deleteStatus: false,
					};
				}
				let foodMenus = [];
				foodMenus = await RestaurantFoodMenu.findAll({
					where: foodMenuWhere,
					attributes: ["restaurantId"],
					limit: pagination.pageNo * pagination.limit,
				});

				if (foodMenus && foodMenus.length) {
					foodMenus.map((item) => restaurantIds.push(item.restaurantId));
				}
			}
			restaurantWhere[Op.or] = [
				{
					name: {
						[Op.like]: `%${search}%`,
					},
				},
				{
					id: { [Op.in]: restaurantIds },
				},
			];
		}

		Restaurant.findAll({
			where: restaurantWhere,
			...restaurantAdditionalOptions,
			// logging: true,
			// subQuery: false,
			// raw: true,
			include: [
				{
					model: RestaurantType,
					attributes: ["id", "name"],
					...restaurantTypeChecks,
				},
				{
					model: RestaurantTiming,
					where: {
						deleteStatus: false,
					},
					include: [
						{
							model: RestaurantTimeLap,
							as: "restaurant_time_laps",
							attributes: ["id", "from", "to"],
						},
					],
					required: false,
					attributes: ["id", "day"],
				},
				{
					model: DashboardCard,
					where: dashboardCondition,
					attributes: ["id", "name", "slug"],
					as: "dashboardCard",
				},
				{
					model: Favourite,
					where: {
						dashboardCardId: dashboardCardId,
						userId: userId,
					},
					attributes: ["id"],
					required: false,
				},
				// {
				//     model: RestaurantFoodMenu,
				//     // required: false
				//     // as: "RestaurantFoodMenu",
				// }
			],
			...pagination,
		})
			.then(async (restaurants) => {
				// console.log('testttttt', restaurants[0], restaurants.length)
				if (restaurants && restaurants.length) {
					let foundRestaurantIds = []
					let restaurantsJson = [];
					for (let i = 0; i < restaurants.length; i++) {
						let item = restaurants[i];
						let record = item.toJSON();
						foundRestaurantIds.push(item.id)
						record.restaurant_medias = []
						let reviewRecord = await Review.findOne({
							where: {
								restaurantId: record.id,
							},
							attributes: [
								[sequelize.fn("AVG", sequelize.col("foodStars")), "rating"],
								[sequelize.fn("count", sequelize.col("id")), "total_ratings"],
							],
						});
						reviewRecord = reviewRecord.toJSON();
						record.rating = reviewRecord.rating
							? Number(Number(reviewRecord.rating).toFixed(2))
							: 5.0;
						record.total_ratings = reviewRecord.total_ratings
							? Number(reviewRecord.total_ratings)
							: 1;

						if (idsDistance) {
							record.away_distance = idsDistance.length
								? idsDistance[record.id]
								: "50 m";
						} else if (lat && long) {
							// console.log('here')
							// let distance = general_helper.getDistanceFromLatLonInKm(lat, long, record.latitude, record.longitude)
							let distanceRoundValue = parseFloat(record.away_distance).toFixed(
								1
							);

							if (parseFloat(distanceRoundValue) < 0.05) {
								distanceRoundValue = "50 m";
							} else if (Number(distanceRoundValue) < 1) {
								distanceRoundValue = distanceRoundValue * 1000 + " m";
							} else {
								distanceRoundValue = distanceRoundValue + " miles";
							}
							console.log("distanceRoundValue:", distanceRoundValue);
							record.away_distance = distanceRoundValue;
						} else {
							record.away_distance = "50 m";
						}

						delete record.favourites;
						if (item.favourites && item.favourites.length) {
							record.is_favourite = true;
						} else {
							record.is_favourite = false;
						}
						// let profile = { ...record.restaurant_profile }
						// let media = { ...record.restaurant_medium }

						// delete record.restaurant_profile
						// delete record.restaurant_medium

						// record = { ...record, ...profile }
						// record = { ...record, ...media }

						restaurantsJson.push(record);
					}

					let restaurant_medias = await RestaurantMedia.findAll({ where: { restaurantId: { [Op.in]: foundRestaurantIds } } })

					if (restaurant_medias.length) {

						restaurantsJson.map(item => {
							let restaurantMedia = restaurant_medias.filter(mediaId => mediaId.restaurantId === item.id)
							if (restaurantMedia && restaurantMedia.length) {

								let logoMedia = []
								let bannerMedia = []
								let proofOfOwnershipMedia = []
								let menuMedia = []
								let alcoholLicenseMedia = []
								for (let i = 0; i < restaurantMedia.length; i++) {
									if (restaurantMedia[i].mediaType == 'logo') {
										logoMedia.push(restaurantMedia[i].media)
									}
									else if (restaurantMedia[i].mediaType == 'banner') {
										bannerMedia.push(restaurantMedia[i].media)
									}
									else if (restaurantMedia[i].mediaType == 'proofOfOwnership') {
										proofOfOwnershipMedia.push(restaurantMedia[i].media)
									}
									else if (restaurantMedia[i].mediaType == 'menu') {
										menuMedia.push(restaurantMedia[i].media)
									}
									else if (restaurantMedia[i].mediaType == 'alcoholLicense') {
										alcoholLicenseMedia.push(restaurantMedia[i].media)
									}
								}
								let restaurantMediaObject = {
									['logo']: logoMedia,
									['banner']: bannerMedia,
									['proofOfOwnership']: proofOfOwnershipMedia,
									['menu']: menuMedia,
									['alcoholLicense']: alcoholLicenseMedia
								}
								item.restaurant_medias = restaurantMediaObject
								// console.log('item', item);
							}

						})
					}
					// console.log('restaurantsJson =>', restaurantsJson);

					resolve({
						message: "Data fetched successfully.",
						data: restaurantsJson,
						slug: restaurantListTypeId,
					});
				} else {
					resolve({
						message: "Unable to fetch data.",
						data: [],
						slug: restaurantListTypeId,
					});
				}
			})
			.catch((err) => {
				console.log("this is error", err);
				reject("Error! Internal Server Error.");
			});
	});
}