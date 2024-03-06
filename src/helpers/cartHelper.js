
const { Op } = require('sequelize')

// Custom Libraries
const rpcClient = require("../lib/rpcClient");
const { sequelize_conn } = require("../../config/database");

// Modals
const Cart = require('../app/SqlModels/Cart');
const CartProduct = require('../app/SqlModels/CartProduct');
const UserSetting = require('../app/SqlModels/UserSetting');
const { Restaurant } = require('../app/SqlModels/Restaurant');
const RestaurantMenuProduct = require('../app/SqlModels/RestaurantMenuProduct');
const CartProductVariation = require('../app/SqlModels/CartProductVariation');
const CartVariationProduct = require('../app/SqlModels/CartVariationProduct');
const RestaurantMenuProductVariation = require('../app/SqlModels/RestaurantMenuProductVariation');
const VariationProduct = require('../app/SqlModels/VariationProduct');
const DashboardCard = require('../app/SqlModels/dashboardCard');
const DeliveryRates = require('../app/SqlModels/DeliveryRates');

// helpers
const generalHelpers = require('./general_helper');

module.exports = {
	getCartData: (userId, latitude = null, longitude = null) => {

		return new Promise((resolve, reject) => {
			Cart.findOne({
				where: {
					userId
				},
				attributes: ['id', 'dashboardCardId', 'restaurantId', 'promoData'],
				include: [{
					model: CartProduct,
					attributes: ['id', 'quantity', 'instructions', 'foodMenuId', 'productNotAvailableValueId'],
					include: [{
						model: RestaurantMenuProduct,
						as: 'productData',
						attributes: ["id", "name", "detail", "image", "price", "foodType", "currency", "currencySymbol", "deleteStatus", "isAvailable", "ageRestrictedItem"]
					},
					{
						model: CartProductVariation,
						include: [
							{
								model: RestaurantMenuProductVariation,
								as: 'variationData',
								attributes: ['id', "name", "isMultipleSelection", "isRequired", "min", "max"],
							},
							{
								model: CartVariationProduct,
								attributes: ['id'],
								include: {
									model: VariationProduct,
									attributes: ['id', "name", "price"]
								},
								as: 'variation_products'
							},
						],
						attributes: ['id'],
						as: 'variations'

					}]
				},
				{
					model: Restaurant,
					// include: [{
					//     model: DeliveryRates,
					//     required: false
					// }],
				},
				{
					model: DashboardCard,
					attributes: ['id', 'name', 'slug']
				}
				]
			}).then(async cartData => {
				if (cartData) {
					console.log('cart data ::', cartData.toJSON())
					let data = cartData.toJSON()



					let subTotal = 0
					data.unavailableItems = []
					data.cart_products.map(item => {
						let itemPrice = Number(item.productData.price)
						let variations = []
						item.variations.map(variationItem => {
							let variation_products = []
							// console.log(variation_products);
							variationItem.variation_products.map(variationProductItem => {
								variation_products.push(variationProductItem.variation_product)
								itemPrice += Number(variationProductItem.variation_product.price)
							})
							let variation = variationItem
							variation.variation_products = variation_products
							variations.push(variation)
						})
						let quantity = item.quantity
						let price = Number(itemPrice) * Number(quantity)
						subTotal += price
						item.productData.variations = variations
						delete item.variations
						if (item.productData.deleteStatus || item.productData.isAvailable == 0) {
							data.unavailableItems.push(item)
						}
					})

					data.vat = data.restaurant.vat ? data.restaurant.vat : 0
					data.subTotal = subTotal
					data.total = parseFloat(subTotal)

					if (data.promoData) {
						let promoData = JSON.parse(data.promoData)
						if (promoData.minOrderLimit < data.subTotal) {
							let discount = 0
							if (promoData.type === 'percentage') {
								discount = data.subTotal / 100 * promoData.discount
								if (discount > promoData.maxDiscount) {
									discount = promoData.maxDiscount
								}
							} else if (promoData.type === 'flat') {
								discount = promoData.discount
							}

							data.promoCode = promoData.promoCode
							data.discount = discount
							data.total = data.total - discount
						}
						delete data.promoData
					}
					// TODO: geniieRiderDeliveryRatePerMile is a constant value, it has to be changed in future

					let geniieRiderDeliveryRatePerMile = 2

					let restaurantToCustomerDistance = 5

					if (data?.dashboard_card?.slug === 'delivery') {
						// let restaurantToCustomerDistance = 5

						if (latitude && longitude) {

							restaurantToCustomerDistance = generalHelpers.getDistanceFromLatLonInKm(Number(latitude), Number(longitude), Number(data.restaurant.latitude), Number(data.restaurant.longitude))
						}
						console.log('data.total ::', data.total)
						let deliveryRates = []
						if (data?.restaurant?.deliveryOption && data?.restaurant?.id) {
							let whereCondition = data.restaurant.deliveryOption == 'rateViaOrderPrice' ?
								{
									valueOver: data.total == 0 ? { [Op.lte]: data.total } : { [Op.lt]: data.total }
								}
								:
								(data.restaurant.deliveryOption == 'rateViaMiles') &&
								{
									valueOver: restaurantToCustomerDistance == 0 ? { [Op.lte]: restaurantToCustomerDistance } : { [Op.lt]: restaurantToCustomerDistance }
								}
							console.log('where ::', {
								restaurantId: data.restaurant.id,
								type: data.restaurant.deliveryOption,
								...whereCondition,
							})
							deliveryRates = await DeliveryRates.findAll({
								where: {
									restaurantId: data.restaurant.id,
									type: data.restaurant.deliveryOption,
									...whereCondition,
								},
								order: [['valueOver', 'DESC']],
								limit: 1,
								raw: true
							})
						}
						console.log('before ::', deliveryRates)
						deliveryRates = deliveryRates.length ? deliveryRates[0] : {}
						console.log('after ::', deliveryRates, restaurantToCustomerDistance)
						let userSettingsData = await UserSetting.findOne({ where: { userId: userId, slug: 'allow_my_rider', status: true } })
						console.log('userSettingsData ::', userSettingsData)
						if ((userSettingsData && Object.keys(userSettingsData).length) && (data.restaurant.branchOwnRiders == 'true' || data.restaurant.branchOwnRiders == true)) {
							// data.deliveryCharges = deliveryRates?.deliveryCharges ? Number((parseFloat(restaurantToCustomerDistance) * parseFloat(deliveryRates.deliveryCharges)).toFixed(5)) : 0
							data.deliveryCharges = deliveryRates?.deliveryCharges ? Number(deliveryRates.deliveryCharges) : 0
						} else {
							data.deliveryCharges = Number((parseFloat(restaurantToCustomerDistance) * parseFloat(geniieRiderDeliveryRatePerMile)).toFixed(2))
						}

						data.total = Number((parseFloat(data.total) + parseFloat(data.deliveryCharges)).toFixed(2))
					}

					data.total += parseFloat(data.vat)
					data.deliveryDistance = restaurantToCustomerDistance

					const getUsers = (userIds) => {
						return new Promise((resolve, reject) => {
							try {
								rpcClient.UserService.GetUsers({ ids: userIds }, function (error, responseData) {
									if (error) return reject(error)
									return resolve(responseData)
								});
							} catch (error) {
								return reject(error)
							}
						})
					}

					try {
						let response = await getUsers([data.restaurant.userId])
						let users = JSON.parse(response.data);

						let userData = users[0]
						delete userData.roles
						delete userData.parentId
						delete userData.bank_account
						delete userData.user_addresses

						data.restaurantUser = userData
					} catch (error) {
						console.log(error)
						data.restaurantUser = null
					}

					resolve(data)
				} else {
					resolve({})
				}
			}).catch(err => {
				console.log(err);
				resolve({})
			})
		})
	}
}