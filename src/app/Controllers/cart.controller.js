//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')


const { Op } = require('sequelize')

// Custom Libraries
const rpcClient = require("../../lib/rpcClient");
const { sequelize_conn } = require("../../../config/database");

// Modals
const Cart = require('../SqlModels/Cart');
const CartProduct = require('../SqlModels/CartProduct');
const UserSetting = require('../SqlModels/UserSetting');
const { Restaurant } = require('../SqlModels/Restaurant');
const RestaurantFoodMenu = require('../SqlModels/RestaurantFoodMenu');
const RestaurantMenuProduct = require('../SqlModels/RestaurantMenuProduct');
const CartProductVariation = require('../SqlModels/CartProductVariation');
const CartVariationProduct = require('../SqlModels/CartVariationProduct');
const RestaurantMenuProductVariation = require('../SqlModels/RestaurantMenuProductVariation');
const VariationProduct = require('../SqlModels/VariationProduct');
const DashboardCard = require('../SqlModels/dashboardCard');
const DeliveryRates = require('../SqlModels/DeliveryRates');

// helpers
const generalHelpers = require('../../helpers/general_helper');
const { getCartData } = require('../../helpers/cartHelper');

exports.getAll = async function (req, res) {

	try {

		let geoLocation = null;
		let parseData = generalHelpers.IsValidJSONString(req.headers['geolocation'])
		if (parseData) {
			geoLocation = parseData
		}

		let userId = req.user.id
		let cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long)

		return respondWithSuccess(req, res, 'cart fetched successfully', cartData)
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500)
	}
	// Cart.findOne({
	//     where: {
	//         userId
	//     },
	//     attributes: ['id', 'dashboardCardId', 'restaurantId'],
	//     include: [{
	//         model: CartProduct,
	//         attributes: ['id', 'quantity', 'instructions', 'foodMenuId', "productNotAvailableValueId"],
	//         include: [{
	//             model: RestaurantMenuProduct,
	//             as: 'productData',
	//             attributes: ["id", "name", "detail", "image", "price", "foodType", "currency", "currencySymbol"]
	//         },
	//         {
	//             model: CartProductVariation,
	//             include: [
	//                 {
	//                     model: RestaurantMenuProductVariation,
	//                     as: 'variationData',
	//                     attributes: ['id', "name", "isMultipleSelection", "isRequired", "min", "max"],
	//                 },
	//                 {
	//                     model: CartVariationProduct,
	//                     attributes: ['id'],
	//                     include: {
	//                         model: VariationProduct,
	//                         attributes: ['id', "name", "price"]
	//                     },
	//                     as: 'variation_products'
	//                 },
	//             ],
	//             attributes: ['id'],
	//             as: 'variations'

	//         }]
	//     },
	//     {
	//         model: Restaurant,
	//     },
	//     {
	//         model: DashboardCard
	//     }
	//     ]
	// }).then(async cartData => {

	//     if (cartData) {
	//         let data = cartData.toJSON()
	//         let subTotal = 0
	//         data.cart_products.map(item => {
	//             let itemPrice = Number(item.productData.price)
	//             let variations = []
	//             item.variations.map(variationItem => {
	//                 let variation_products = []
	//                 variationItem.variation_products.map(variationProductItem => {
	//                     variation_products.push(variationProductItem.variation_product)
	//                     itemPrice += Number(variationProductItem.variation_product.price)
	//                 })
	//                 let variation = variationItem
	//                 variation.variation_products = variation_products
	//                 variations.push(variation)
	//             })
	//             let quantity = item.quantity
	//             let price = Number(itemPrice) * Number(quantity)
	//             subTotal += price
	//             item.productData.variations = variations
	//             delete item.variations
	//         })
	//         data.vat = 0
	//         data.subTotal = subTotal
	//         console.log(data.dashboard_card);
	//         if (data?.dashboard_card?.slug === 'delivery') {

	//             data.deliveryCharges = Number(data.restaurant.deliveryCharges)
	//             data.total = Number(subTotal) + Number(data.restaurant.deliveryCharges)
	//         } else {
	//             data.total = Number(subTotal)
	//         }

	//         return res.send({
	//             data: data
	//         })
	//     } else {
	//         return res.send({
	//             data: {}
	//         })
	//     }
	// }).catch(err => {
	//     console.log(err);
	//     return res.status(500).send({
	//         message: 'Internal Server Error.',
	//     })
	// })
}

exports.post = async function (req, res) {
	// console.log('req body =>', req.body);
	let userId = req.user.id
	let restaurantId = req.body.restaurantId
	let dashboardCardId = req.body.dashboardCardId
	let productId = req.body.productId
	let quantity = req.body.quantity
	let instructions = req.body.instructions
	let foodMenuId = req.body.foodMenuId
	let productNotAvailableValueId = req.body.productNotAvailableValueId
	let productVariationData = req.body.productVariationData
	let removeCart = req.body.removeCart
	let latitude = req.body.lat
	let longitude = req.body.long

	Restaurant.findOne({
		where: {
			deleteStatus: false,
			id: restaurantId
		},
		include: [
			{
				model: DashboardCard,
				where: {
					deleteStatus: false,
					id: dashboardCardId
				},
				as: 'dashboardCard'
			},
			{
				model: RestaurantFoodMenu,
				where: {
					deleteStatus: false,
					id: foodMenuId
				},
				include: [{
					model: RestaurantMenuProduct,
					where: {
						id: productId
					}
				}]
			}],
	}).then(restaurant => {
		if (restaurant) {
			Cart.findOne({
				where: {
					userId
				}
			}).then(async item => {
				let cartData = item
				if (item && item.dashboardCardId != dashboardCardId) {
					if (removeCart || removeCart === 'true') {
						await item.destroy()
						cartData = null
					} else {
						return res.status(400).send({
							message: `Product is already added to cart from other option.`,
							removeCart: true
						})
					}
				}


				if (item && item.restaurantId != restaurantId) {
					if (removeCart || removeCart === 'true') {
						await item.destroy()
						cartData = null
					} else {
						return res.status(400).send({
							message: 'Product is already added to cart from another restaurant.',
							removeCart: true
						})
					}
				}

				if (!cartData) {
					let newRecord = new Cart({
						userId,
						restaurantId,
						dashboardCardId
					})
					cartData = await newRecord.save()
				}

				if (cartData) {
					let productData = {
						cartId: cartData.id,
						productId,
						quantity,
						instructions,
						foodMenuId,
						productNotAvailableValueId
					}

					let alreadyAdded = await CartProduct.findOne({
						where: {
							cartId: cartData.id,
							productId
						}
					})
					if (alreadyAdded) {
						if (productVariationData && productVariationData.length) {
							let data = await CartProductVariation.findAll({
								where: {
									cartProductId: alreadyAdded.id
								},
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
								]
							})
							if (data && data.length) {
								if (data.length === productVariationData.length) {
									let isSame = false
									for (let i = 0; i < data.length; i++) {
										const item = data[i].toJSON();
										let newVariationData = productVariationData.find(productDateItem => productDateItem.variationId == item.variationData.id)
										if (newVariationData) {
											let variationProductIds = item.variation_products.map(item => item.variation_product.id)
											let areVariationsSame = false
											if (variationProductIds.length === newVariationData.variationProductIds.length) {
												for (let j = 0; j < variationProductIds.length; j++) {
													if (variationProductIds.includes(Number(newVariationData.variationProductIds[j]))) {
														areVariationsSame = true
													} else {
														areVariationsSame = false
														console.log(false)
														break
													}
												}
												if (areVariationsSame) {
													isSame = true
												} else {
													isSame = false
													break
												}
											} else {
												isSame = false
												break
											}
										} else {
											isSame = false
											break
										}
									}
									if (isSame) {
										return res.status(400).send({
											message: 'Product is already added to cart.'
										})
									}
								}
							}
						} else {
							let data = await CartProductVariation.findOne({
								where: {
									cartProductId: alreadyAdded.id
								}
							})
							if (!data) {
								alreadyAdded.quantity = Number(alreadyAdded.quantity) + Number(quantity)
								await alreadyAdded.save()

								let cartData = await getCartData(userId, latitude, longitude)

								return res.send({
									message: 'Product has been added to cart successfully.',
									data: cartData
								})
							}
						}
					}

					let newRecord = new CartProduct(productData)

					newRecord.save()
						.then(async productPostedData => {
							if (productPostedData) {

								if (productVariationData && productVariationData.length) {
									let cartProductId = productPostedData.id
									for (let i = 0; i < productVariationData.length; i++) {
										let variationData = productVariationData[i]
										let insertedRecords = await CartProductVariation.create({ variationId: variationData.variationId, cartProductId })
										let insertProductVariation = []
										if (variationData.variationProductIds && variationData.variationProductIds) {
											variationData.variationProductIds.map(item => {
												insertProductVariation.push({
													cartProductVariationId: insertedRecords.id,
													variationProductId: item
												})
											})
										}
										if (insertProductVariation.length) {
											await CartVariationProduct.bulkCreate(insertProductVariation)
										}
									}

								}

								let cartData = await getCartData(userId, latitude, longitude)

								return res.send({
									message: 'Product has been added to cart successfully.',
									data: cartData
								})
							}
						})

				} else {
					return respondWithError(req, res, '', null, 500)
				}
			}).catch(err => {
				console.log(err);
				return respondWithError(req, res, '', null, 500)
			})
		} else {
			return res.status(400).send({
				message: 'Unable to add product into cart. Product not found.',
				// data: postedData
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500)
	})
}

exports.update = async function (req, res) {

	let userId = req.user.id
	let restaurantId = req.body.restaurantId
	let productId = req.body.productId
	let foodMenuId = req.body.foodMenuId
	let action = req.body.action
	let geoLocation = null;
	let parseData = generalHelpers.IsValidJSONString(req.headers['geolocation'])
	if (parseData) {
		geoLocation = parseData
	}

	Restaurant.findOne({
		where: {
			deleteStatus: false,
			id: restaurantId
		},
		include: [{
			model: RestaurantFoodMenu,
			where: {
				deleteStatus: false,
				id: foodMenuId
			},
			include: [{
				model: RestaurantMenuProduct,
				where: {
					id: productId
				}
			}]
		}]
	}).then(restaurant => {
		if (restaurant) {

			Cart.findOne({
				where: {
					userId,
					restaurantId
				},
				include: [
					{
						model: CartProduct,
						// where: {
						//     productId: productId
						// }
					}
				]
			}).then(async item => {
				if (item) {
					// console.log();
					let productData = item.cart_products.find(productData => productData.productId == productId)
					console.log(productData.quantity);
					if (productData) {
						if (action === 'add') {
							productData.quantity++
						} else if (action === 'remove') {
							productData.quantity--
						}
						console.log(productData.id, productData.quantity);
						if (productData.quantity <= 0) {
							if (item.cart_products.length <= 1) {
								await productData.destroy()
								await item.destroy()
							} else {
								await productData.destroy()
							}
						} else {
							await productData.save()
						}
						let cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long)
						return res.send({
							message: 'Quantity has been added updated successfully.',
							data: cartData
						})
					} else {
						return res.status(400).send({
							message: 'Unable to update quantity of item. Product not found.',
						})
					}

				} else {
					return res.status(400).send({
						message: 'Unable to update quantity of item. Cart not found.',
					})
				}
			}).catch(err => {
				console.log(err);
				return respondWithError(req, res, '', null, 500)
			})
		} else {
			return res.status(400).send({
				message: 'Unable to add product into cart. Product not found.',
				// data: postedData
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500)
	})
}

exports.delete = async function (req, res) {
	let id = req.params.id
	let userId = req.user.id
	// let restaurantId = req.query.restaurantId
	let geoLocation = null;
	let parseData = generalHelpers.IsValidJSONString(req.headers['geolocation'])
	if (parseData) {
		geoLocation = parseData
	}

	Cart.findOne({
		where: {
			userId
		},
		include: CartProduct
	}).then(async item => {
		if (item) {
			if (item.cart_products.length) {
				if (item.cart_products.length === 1 || id === 'all') {
					CartProduct.destroy({
						where: {
							cartId: item.id
						}
					})
					item.destroy().then(destroyedItem => {
						// console.log(destroyedItem);
						if (destroyedItem) {
							return res.send({
								message: 'Product has been removed from cart.',
								data: {}
							})
						} else {
							return res.status(400).send({
								message: 'Unable to delete product. Cart is already empty.',
							})
						}
					}).catch(err => {
						console.log(err);
						return respondWithError(req, res, '', null, 500)
					})
				} else {
					CartProduct.destroy({
						where: {
							id,
							cartId: item.id
						}
					}).then(async destroyedItem => {
						// console.log(destroyedItem);
						if (destroyedItem) {
							let cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long)

							return res.send({
								message: 'Product has been removed from cart.',
								data: cartData
							})
						} else {
							return res.status(400).send({
								message: 'Unable to delete product. Cart is already empty.',
							})
						}
					}).catch(err => {
						console.log(err);
						return respondWithError(req, res, '', null, 500)
					})
				}
			} else {
				return res.status(400).send({
					message: 'Unable to delete product. Cart is already empty.',
				})
			}
		} else {
			return res.status(400).send({
				message: 'Unable to update quantity of item. Cart not found.',
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500)
	})
}

exports.applyPromo = async function (req, res) {
	let promoData = req.body
	let userId = req.user.id
	let geoLocation = null;
	let parseData = generalHelpers.IsValidJSONString(req.headers['geolocation'])
	if (parseData) {
		geoLocation = parseData
	}

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
					res.send({
						message: "Promo Code has been applied successfully.",
						data: cartData
					})
				} else {
					res.status(400).send({
						message: "Unable to apply promo code. Please try again later"
					})
				}
			})
		} else {
			return res.status(400).send({
				message: `Minimum Order for this promo code is ${promoData.minOrderLimit}.Add ${promoData.minOrderLimit - cartData.subTotal} more`
			})
		}
	} else {
		res.status(400).send({
			message: "Cart not found."
		})
	}

}

exports.removePromo = async function (req, res) {
	let userId = req.user.id
	let geoLocation = null;
	let parseData = generalHelpers.IsValidJSONString(req.headers['geolocation'])
	if (parseData) {
		geoLocation = parseData
	}

	let cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long)
	if (Object.keys(cartData).length) {
		Cart.update({
			promoData: null
		}, {
			where: {
				userId: userId,
				id: cartData.id,
			}
		}).then(async data => {

			if (data && data[0] === 1) {
				cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long)
				res.send({
					message: "Promo Code has been removed successfully.",
					data: cartData
				})
			} else {
				res.status(400).send({
					message: "Unable to remove promo code. Please try again later"
				})
			}
		})
	} else {
		res.status(400).send({
			message: "Cart not found."
		})
	}

}