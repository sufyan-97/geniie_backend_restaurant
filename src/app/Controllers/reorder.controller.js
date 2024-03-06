//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

const { Op } = require("sequelize");
const axios = require("axios");

// Modals
const Order = require("../SqlModels/Order");
const OrderStatus = require("../SqlModels/OrderStatus");
const Cart = require("../SqlModels/Cart");

const { Restaurant } = require("../SqlModels/Restaurant");
const RestaurantFoodMenu = require("../SqlModels/RestaurantFoodMenu");
const RestaurantMenuProduct = require("../SqlModels/RestaurantMenuProduct");
const CartProductVariation = require("../SqlModels/CartProductVariation");
const CartVariationProduct = require("../SqlModels/CartVariationProduct");
const RestaurantMenuProductVariation = require("../SqlModels/RestaurantMenuProductVariation");
const VariationProduct = require("../SqlModels/VariationProduct");
const CartProduct = require("../SqlModels/CartProduct");
const LatLong = require("../SqlModels/LatLong");
const LatLongRestaurant = require("../SqlModels/LatLongRestaurant");

// helpers
const { getCartData } = require('../../helpers/cartHelper')
const general_helper = require("../../helpers/general_helper");

// const
const {
	MAIN_SERVICE_URL,
	BASIC_AUTH_USER,
	BASIC_AUTH_PASSWORD,
} = require("../../../config/constants");

exports.getAll = async function (req, res) {
	let userId = req.user.id;
	let data = {
		activeOrders: [],
		pastOrders: [],
	};
	Order.findAll({
		where: {
			userId,
		},
		include: OrderStatus,
	})
		.then(async (orderData) => {
			if (orderData) {
				orderData.map((item) => {
					if (item.orderStatus !== "Delivered") {
						data.activeOrders.push(item);
					} else {
						data.pastOrders.push(item);
					}
				});

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
			return respondWithError(req, res, '', null, 500);
		});
};

exports.getOne = async function (req, res) {
	let userId = req.user.id;
	let id = req.params.id;

	Order.findOne({
		where: {
			userId,
			[Op.or]: [
				{
					id: id,
				},
				{
					orderId: `#${id}`,
				},
			],
		},
	})
		.then(async (orderData) => {
			if (orderData) {
				orderData = orderData.toJSON();
				OrderStatus.findAll({
					where: { deleteStatus: false },
				})
					.then((data) => {
						// console.log(data);
						let orderStatuses = [];
						data.map((item) => {
							let orderStatus = item.toJSON();
							if (item.id == orderData.orderStatus) {
								orderStatus.isActive = true;
							} else {
								orderStatus.isActive = false;
							}
							orderStatuses.push(orderStatus);
						});

						orderData.orderStatuses = orderStatuses;
						return res.send({
							data: orderData,
						});
					})
					.catch((err) => {
						console.log(err);
						return respondWithError(req, res, '', null, 500);
					});
			} else {
				return res.status(400).send({
					message: "Unable to find order data",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

exports.post = async function (req, res) {
	let userId = req.user.id;
	let lat = req.query.lat;
	let long = req.query.long;
	let id = req.body.id;

	if (!lat || !long) {
		return res.status(400).send({
			message: "Error: Invalid Latitude and longitude.",
		});
	}

	let orderStatus = await OrderStatus.findOne({ where: { slug: "completed" } });

	Order.findOne({
		where: {
			userId,
			orderStatus: orderStatus.id,
			id: id,
		},
	})
		.then(async (orderData) => {
			if (orderData) {
				orderData = orderData.toJSON();
				let cart_products = orderData.orderSummary.cart_products;
				let restaurantId = orderData.restaurantId;
				let dashboardCardId = orderData.orderSummary.dashboardCardId;
				let geoLocation = null;
				let parseData = general_helper.IsValidJSONString(req.headers['geolocation'])
				if (parseData) {
					geoLocation = parseData
				}
				Restaurant.findOne({
					where: {
						deleteStatus: false,
						id: restaurantId,
					},
				})
					.then((restaurant) => {
						if (restaurant) {
							let distance = general_helper.getDistanceFromLatLonInKm(
								lat,
								long,
								restaurant.latitude,
								restaurant.longitude
							);
							console.log(
								distance,
								restaurant.deliveryRadius,
								distance < restaurant.deliveryRadius,
								restaurant.latitude,
								restaurant.longitude
							);

							if (distance > restaurant.deliveryRadius) {
								return res.status(400).send({
									message: "Sorry! This restaurant not serving in your area.",
								});
							}

							Cart.findOne({
								where: {
									userId,
									restaurantId,
								},
							})
								.then(async (item) => {
									let cartData = item;
									if (cartData) {
										await cartData.destroy();
									}

									let newRecord = new Cart({
										userId,
										restaurantId,
										dashboardCardId,
									});

									cartData = await newRecord.save();

									if (cartData) {
										let itemsToCreate = [];
										for (let i = 0; i < cart_products.length; i++) {
											let item = cart_products[i];
											let foodMenuId = item.foodMenuId;
											let productId = item.productData.id;
											let productDetail = await RestaurantFoodMenu.findOne({
												where: {
													deleteStatus: false,
													id: foodMenuId,
												},
												include: [
													{
														model: RestaurantMenuProduct,
														where: {
															id: productId,
														},
													},
												],
											});
											if (productDetail) {
												itemsToCreate.push({
													cartId: cartData.id,
													productId,
													quantity: item.quantity,
													instructions: item.instructions,
													foodMenuId,
													productNotAvailableValueId:
														item.productNotAvailableValueId,
												});
											} else {
												return res.status(400).send({
													message:
														"Unable to add product into cart. Product not found.",
												});
											}
										}

										await CartProduct.bulkCreate(itemsToCreate);

										cartData = await getCartData(userId, geoLocation?.lat, geoLocation?.long);

										return res.send({
											message: "Products has been added to cart successfully.",
											data: cartData,
										});
									} else {
										return res.status(400).send({
											message: "Unable to add product into cart.",
											// data: postedData
										});
									}
								})
								.catch((err) => {
									console.log(err);
									return respondWithError(req, res, '', null, 500);
								});
						} else {
							return res.status(400).send({
								message: "Unable to add product into cart. Product not found.",
								// data: postedData
							});
						}
					})
					.catch((err) => {
						console.log(err);
						return respondWithError(req, res, '', null, 500);
					});
			} else {
				return res.status(400).send({
					message: "Unable to reorder. Order not completed yet.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

exports.put = async function (req, res) {
	let userId = req.user.id;
	let orderId = req.body.orderId;
	let restaurantId = req.body.restaurantId;
	let orderStatusId = req.body.orderStatusId;

	//CHECK IF USER OWNS THIS RESTAURANT
	OrderStatus.findOne({
		where: {
			id: orderStatusId,
		},
	})
		.then((item) => {
			if (item) {
				Restaurant.findOne({
					where: {
						userId: userId,
						deleteStatus: false,
					},
				})
					.then((item) => {
						if (item) {
							Order.findOne({
								where: {
									restaurantId: restaurantId,
									id: orderId,
								},
							})
								.then(async (orderData) => {
									if (orderData) {
										orderData.orderStatus = orderStatusId;
										orderData.save();
										return res.send({
											data: orderData,
										});
									} else {
										return res.status(400).send({
											message: "Unable to find order data",
										});
									}
								})
								.catch((err) => {
									console.log(err);
									return respondWithError(req, res, '', null, 500);
								});
						} else {
							return res.status(400).send({
								message: "Error: Unauthorize access",
							});
						}
					})
					.catch((err) => {
						console.log(err);
						return respondWithError(req, res, '', null, 500);
					});
			} else {
				return res.status(400).send({
					message: "Error: Unauthorize access",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

// function getCartData(userId) {
//   return new Promise((resolve, reject) => {
//     Cart.findOne({
//       where: {
//         userId,
//       },
//       attributes: ["id", "dashboardCardId", "restaurantId"],
//       include: [
//         {
//           model: CartProduct,
//           attributes: [
//             "id",
//             "quantity",
//             "instructions",
//             "foodMenuId",
//             "productNotAvailableValueId",
//           ],
//           include: [
//             {
//               model: RestaurantMenuProduct,
//               as: "productData",
//               attributes: [
//                 "id",
//                 "name",
//                 "detail",
//                 "image",
//                 "price",
//                 "foodType",
//                 "currency",
//                 "currencySymbol",
//               ],
//             },
//             {
//               model: CartProductVariation,
//               include: [
//                 {
//                   model: RestaurantMenuProductVariation,
//                   as: "variationData",
//                   attributes: [
//                     "id",
//                     "name",
//                     "isMultipleSelection",
//                     "isRequired",
//                     "min",
//                     "max",
//                   ],
//                 },
//                 {
//                   model: CartVariationProduct,
//                   attributes: ["id"],
//                   include: {
//                     model: VariationProduct,
//                     attributes: ["id", "name", "price"],
//                   },
//                   as: "variation_products",
//                 },
//               ],
//               attributes: ["id"],
//               as: "variations",
//             },
//           ],
//         },
//         {
//           model: Restaurant,
//         },
//       ],
//     })
//       .then(async (cartData) => {
//         if (cartData) {
//           let data = cartData.toJSON();
//           let subTotal = 0;
//           data.cart_products.map((item) => {
//             let itemPrice = Number(item.productData.price);
//             let variations = [];
//             item.variations.map((variationItem) => {
//               let variation_products = [];
//               variationItem.variation_products.map((variationProductItem) => {
//                 variation_products.push(variationProductItem.variation_product);
//                 itemPrice += Number(
//                   variationProductItem.variation_product.price
//                 );
//               });
//               let variation = variationItem.variationData;
//               variation.variation_products = variation_products;
//               variations.push(variation);
//             });
//             console.log(itemPrice);
//             let quantity = item.quantity;
//             let price = Number(itemPrice) * Number(quantity);
//             subTotal += price;
//             item.productData.variations = variations;
//             delete item.variations;
//           });

//           data.vat = 0;
//           data.subTotal = subTotal;
//           data.deliveryCharges = Number(data.restaurant.deliveryCharges);
//           data.total =
//             Number(subTotal) + Number(data.restaurant.deliveryCharges);
//           // delete data.restaurant

//           resolve(data);
//         } else {
//           resolve({});
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         resolve({});
//       });
//   });
// }
