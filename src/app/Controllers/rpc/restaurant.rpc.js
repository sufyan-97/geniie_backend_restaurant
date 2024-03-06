// Libraries
const sequelize = require("sequelize");
const { Op } = require("sequelize");
const axios = require("axios");
const moment = require("moment");

// Custom Libraries
// const rpcClient = require("../../lib/rpcClient");
const { sequelize_conn } = require("../../../../config/database");

// helpers
const generalHelper = require("../../../helpers/general_helper");
const { getCartData } = require("../../../helpers/cartHelper");

// const bookingHelper = require("../../../helpers/bookingHelper");
// const { saveOrderHistory } = require("../../../helpers/general_helper");
// const { refundToWallet } = require('../../../helpers/rpcHelper');

// Modals
const { Restaurant } = require("../../SqlModels/Restaurant");
const Cart = require("../../SqlModels/Cart");
// const Booking = require("../../SqlModels/Booking");
// const OrderStatus = require("../../SqlModels/OrderStatus");
// const CartProduct = require("../../SqlModels/CartProduct");
// const DashboardCard = require("../../SqlModels/dashboardCard");
// const OrderHistory = require("../../SqlModels/OrderHistory");
// const Review = require('../../SqlModels/Review');


// Constants
// const app_constants = require("../Constants/app.constants");

//RPC method
exports.getAllRestaurant = async function (call, callback) {
	try {
		let reqData = call.request;

		let whereCondition = {}

		if (reqData.type === 'provider') {
			whereCondition = {
				providerId: { [Op.in]: reqData.id }
			}
		} else {
			whereCondition = {
				id: { [Op.in]: reqData.id }
			}
		}

		let restaurants = ''
		if (reqData.type === 'getAllBranchNameForRidersList' || reqData.type === 'getBranchNameForBranchRiderRegistration') {
			restaurants = await Restaurant.findAll({
				where: {
					// providerId: reqData.providerId,
					userId: { [Op.in]: reqData.id },
					status: 'active',
					deleteStatus: false,
				},
				attributes: ['id', 'name', 'userId']
			});
		}
		else if (reqData.type === 'cityWiseData') {
			restaurants = await Restaurant.findAll({
				where: {
					state: { [Op.in]: reqData.id },
					status: 'active',
					deleteStatus: false,
				},
				attributes: ['id', 'name', 'providerId', 'userId']
			});
		}
		else {

			restaurants = await Restaurant.findAll({
				where: {
					// providerId: reqData.providerId,
					...whereCondition,
					status: 'active',
					deleteStatus: false
				}
			});
		}




		return callback(null, { data: JSON.stringify(restaurants) });
	} catch (error) {
		console.log(error);
		return callback({
			status: false,
			message: error.message,
		});
	}
};


exports.applyPromo = async function (call, callback) {
	try {
		console.log(call.request)
		let promoData = JSON.parse(call.request.promoData)
		let userData = JSON.parse(call.request.userData)
		let userId = userData.id
		let geoLocation = call.request.geoLocationData ? JSON.parse(call.request.geoLocationData) : null;

		// let parseData = generalHelper.IsValidJSONString(call.headers['geolocation'])
		// if (parseData) {
		// 	geoLocation = parseData
		// }

		let cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long)
		if (Object.keys(cartData).length && promoData.id) {
			if (Number(promoData.minOrderLimit) < cartData.subTotal) {
				Cart.update({
					promoData: promoData
				}, {
					where: {
						userId: userId,
						id: cartData.id,
					}
				}).then(async data => {

					if (data && data[0] === 1) {
						cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long)
						return callback(null, {
							status: true,
							message: "Promo Code has been applied successfully.",
							data: JSON.stringify(cartData)
						})
					} else {
						return callback({
							status: false,
							message: "Unable to apply promo code. Please try again later"
						})
					}
				})
			} else {
				return callback({
					status: false,
					message: `Minimum Order for this promo code is ${promoData.minOrderLimit}. Add ${promoData.minOrderLimit - cartData.subTotal} more`
				})
			}
		} else {
			callback({
				status: false,
				message: "Cart not found."
			})
		}
	} catch (error) {
		console.log(error)
		callback({
			status: false,
			message: "Internal server error"
		})
	}
}