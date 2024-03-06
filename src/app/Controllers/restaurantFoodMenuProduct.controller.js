const { Op } = require("sequelize");
// Modals
const RestaurantFoodMenu = require("../SqlModels/RestaurantFoodMenu");
const { Restaurant } = require("../SqlModels/Restaurant");
const RestaurantMenuProduct = require("../SqlModels/RestaurantMenuProduct");
const FoodMenuProductType = require("../SqlModels/FoodMenuProductType");
const ProductType = require("../SqlModels/ProductType");

// helpers
const general_helper = require("../../helpers/general_helper");
const RestaurantMenuProductVariation = require("../SqlModels/RestaurantMenuProductVariation");
const VariationProduct = require("../SqlModels/VariationProduct");
const { sequelize_conn } = require("../../../config/database");
// exports.getAll = async function (req, res) {
//     let userId = req.user.id
//     let restaurantId = req.query.restaurantId
//     let restaurantFoodMenuId = req.query.restaurantFoodMenuId
//     Restaurant.findOne({
//         where: {
//             userId: userId,
//             id: restaurantId
//         }
//     }).then(item => {
//         if (item) {
//             RestaurantFoodMenu.findOne({
//                 where:
//                 {
//                     deleteStatus: false,
//                     id: restaurantFoodMenuId
//                 },
//                 include: [
//                     {
//                         model: RestaurantMenuProduct,
//                         required: false
//                     }
//                 ]
//             }).then(data => {
//                 if (data && data.length) {
//                     return res.send({
//                         message: 'Data fetched successfully.',
//                         data: data
//                     })
//                 } else {
//                     return res.status(200).send({
//                         message: 'Unable to fetch data.',
//                         data: []
//                     })
//                 }
//             }).catch(err => {
//                 console.log(err);
//                 return res.status(500).send({
//                     message: 'Internal Server Error.',
//                 })
//             })
//         } else {
//             console.log(err);
//             return res.status(400).send({
//                 message: 'Unable to fetch data.',
//             })
//         }
//     }).catch(err => {
//         console.log(err);
//         return res.status(500).send({
//             message: 'Internal Server Error.',
//         })
//     })
// }

exports.postWithVariation = async function (req, res) {
	// let bodyObject = {

	//     restaurantId: 2,
	//     restaurantFoodMenuId: 12,
	//     name: "Abc123",
	//     detail: "XYZ",
	//     image: "abc.png",
	//     price: 10.75,
	//     foodType: "Amarican",
	//     currency: "Extract From restaurant",
	//     currencySymbol: "Extract From restaurant",
	//     variations: [
	//         {
	//             isMultipleSelection: 'Boolean',
	//             isRequired: "boolean",
	//             name: 'Abc',
	//             min: 1,
	//             max: 1,
	//             variation_products: [
	//                 {
	//                     name: 'abc',
	//                     price: 10.12,
	//                     variations: [{
	//                         isMultipleSelection: 'Boolean',
	//                         isRequired: "boolean",
	//                         name: 'Abcd',
	//                         min: 1,
	//                         max: 1,
	//                         variation_products: [
	//                             {
	//                                 name: 'abc',
	//                                 price: 10.12
	//                             }
	//                         ],
	//                     }]
	//                 }
	//             ],

	//         }
	//     ]
	// }

	let body = JSON.parse(req.body.data);

	let userId = req.user.id;
	let restaurantId = body.restaurantId;
	let restaurantFoodMenuId = body.restaurantFoodMenuId;
	let name = body.name;
	let detail = body.detail;
	let image = req.body.image;
	let price = body.price;
	let ageRestrictedItem = body.ageRestrictedItem ? body.ageRestrictedItem : 0
	// let foodType = body.foodType;
	let variations = body.variations;
	let productTypeIds = body.productTypeIds && body.productTypeIds.length ? body.productTypeIds : [];


	let where = {
		deleteStatus: false,
		userId: userId,
		id: restaurantId,
	};

	if (req.user.roleName === "admin") {
		delete where.userId;
	} else if (req.user.roleName === "provider") {
		delete where.userId;
		where.providerId = userId;
	}
	const sequelizeTransaction = await sequelize_conn.transaction();
	Restaurant.findOne({
		where,
		include: [
			{
				model: RestaurantFoodMenu,
				where: {
					deleteStatus: false,
					id: restaurantFoodMenuId,
				},
				required: false,
			},
		],
	})
		.then(async (item) => {
			// console.log("item.restaurant_food_menus =>", item.restaurant_food_menus);
			if (item) {
				if (
					item &&
					item.restaurant_food_menus &&
					item.restaurant_food_menus.length
				) {
					let currency = item.currency;
					let currencySymbol = item.currencySymbol;

					let restaurantFoodMenuData = await RestaurantFoodMenu.findOne({
						where: {
							id: restaurantFoodMenuId,
							name: 'Popular',
							restaurantId: restaurantId,
							deleteStatus: false
						},
						attributes: ["id"]
					})
					if (restaurantFoodMenuData) {
						let restaurantMenuProductsList = await RestaurantMenuProduct.findAll({
							where: {
								restaurantFoodMenuId: restaurantFoodMenuData.id,
								deleteStatus: false,
							}
						})

						if (restaurantMenuProductsList && restaurantMenuProductsList.length > 5) {
							return res.status(400).send({
								message: "Cannot add more then 6 items in popular category.",
							});
						}
					}

					let product = await RestaurantMenuProduct.findOne({
						where: { restaurantFoodMenuId, name, deleteStatus: false },
					});
					if (product) {
						return res.status(400).send({
							message: "product already added to this menu.",
						});
					}

					let data = {
						name,
						restaurantFoodMenuId,
						detail,
						image,
						price,
						ageRestrictedItem,
						// foodType,
						currency,
						currencySymbol,
					};

					// checking if Product Type not exist
					let productTypes = await ProductType.findAll({
						where: {
							id: {
								[Op.in]: productTypeIds,
							},
							deleteStatus: false,
						},
					})
					for (let i = 0; i < productTypeIds.length; i++) {
						let typeId = productTypeIds[i]
						let isTypeExist = productTypes.find(a => a.id == typeId)
						if (!isTypeExist) {
							return res.status(400).send({
								message: `Product Type id ${typeId} not found.`
							})
						}
					}

					let itemData = new RestaurantMenuProduct(data);

					itemData
						.save({ transaction: sequelizeTransaction })
						.then(async (postedData) => {
							try {
								for (let i = 0; i < variations.length; i++) {
									let item = variations[i];
									let variation = await RestaurantMenuProductVariation.create(
										{
											name: item.name,
											restaurantMenuProductId: postedData.id,
											isMultipleSelection: item.isMultipleSelection,
											isRequired: item.isRequired,
											min: item.min,
											max: item.max,
										},
										{ transaction: sequelizeTransaction }
									);
									let variationParentId = variation.id;
									if (item.variation_products.length) {
										for (let j = 0; j < item.variation_products.length; j++) {
											let variationProductItem = item.variation_products[j];
											let postedVariationProduct =
												await VariationProduct.create({
													name: variationProductItem.name,
													price: variationProductItem.price,
													variationId: variationParentId,
												});

											if (variationProductItem.variations) {
												for (
													let k = 0;
													k < variationProductItem.variations.length;
													k++
												) {
													let nestedVariationData =
														variationProductItem.variations[k];
													let nestedVariation =
														await RestaurantMenuProductVariation.create(
															{
																name: nestedVariationData.name,
																restaurantMenuProductId: postedData.id,
																isMultipleSelection:
																	nestedVariationData.isMultipleSelection,
																isRequired: nestedVariationData.isRequired,
																min: nestedVariationData.min,
																max: nestedVariationData.max,
																variationProductId: postedVariationProduct.id,
															},
															{ transaction: sequelizeTransaction }
														);
													if (nestedVariationData.variation_products.length) {
														let bulkData = [];
														nestedVariationData.variation_products.map(
															(variationProductItem) => {

																bulkData.push({
																	name: variationProductItem.name,
																	price: variationProductItem.price,
																	variationId: nestedVariation.id,
																})
															}
														);
														await VariationProduct.bulkCreate(bulkData);
													}
												}
											}
										}
									}
								}

								// add Product Type Ids to food menu product type table
								for (let i = 0; i < productTypeIds.length; i++) {
									let item = productTypeIds[i]
									await FoodMenuProductType.create(
										{
											productId: postedData.id,
											productTypeId: item,
										},
										{ transaction: sequelizeTransaction }
									)
								}
								console.log("asdasdasdsa")
								await sequelizeTransaction.commit();

								let updatedDate = await RestaurantMenuProduct.findOne({
									where: {
										id: postedData.id
									},
									required: false,
									include: [
										{
											model: RestaurantMenuProductVariation,
											where: {
												deleteStatus: false,
												variationProductId: 0
											},
											attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max'],
											include: [{
												model: VariationProduct,
												where: {
													deleteStatus: false
												},
												required: false,
												attributes: ['id', 'name', 'price'],
												// order: [['price', 'DESC']],
												include: [{
													model: RestaurantMenuProductVariation,
													where: {
														deleteStatus: false
													},
													attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max'],
													include: [{
														model: VariationProduct,
														where: {
															deleteStatus: false
														},
														required: false,
														attributes: ['id', 'name', 'price'],
														// order: [['price', 'DESC']],
													}],
													required: false,
													as: 'child'
												}]
											}
											],
											required: false
										},
										{
											model: ProductType,
											through: { attributes: [] },
											where: {
												deleteStatus: false,
											},
											attributes: ["id", "name"],
											required: false,
										}
									],
									order: [['id', 'asc'], [RestaurantMenuProductVariation, VariationProduct, 'price', 'asc']]

								})

								return res.send({
									message:
										"Restaurant Menu product has been added successfully.",
									data: updatedDate,
								});
							} catch (error) {
								console.log(error);
								return res.status(500).send({
									message: "Internal Server Error.",
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
						message: "Menu not found for this restaurant.",
					});
				}
			} else {
				return res.status(400).send({
					message: "Unable to fetch data.",
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

exports.updateWithVariation = async function (req, res) {
	// let bodyObject = {
	//     id: 311,
	//     restaurantId: 2,
	//     restaurantFoodMenuId: 12,
	//     name: "Abcasdasdasdsa",
	//     detail: "XYZ",
	//     image: "abc.png",
	//     price: 2.75,
	//     foodType: "Amarican",
	//     currency: "Extract From restaurant",
	//     currencySymbol: "Extract From restaurant",
	//     variations: [
	//         {
	//             isMultipleSelection: 'Boolean',
	//             isRequired: "boolean",
	//             name: 'Abcdef',
	//             min: 1,
	//             max: 1,
	//             variation_products: [
	//                 {
	//                     name: 'abc132',
	//                     price: 10.12,
	//                     variations: [{
	//                         isMultipleSelection: 'Boolean',
	//                         isRequired: "boolean",
	//                         name: 'Abcd12',
	//                         min: 1,
	//                         max: 1,
	//                         variation_products: [
	//                             {
	//                                 name: 'abc123',
	//                                 price: 10.12
	//                             }
	//                         ],
	//                     }]
	//                 }
	//             ],

	//         }
	//     ]
	// }

	let body = JSON.parse(req.body.data);

	let id = body.id;
	if (!id) {
		return res.status(422).send({
			message: 'Invalid Data'
		})
	}
	let userId = req.user.id;
	let restaurantId = body.restaurantId;
	let restaurantFoodMenuId = body.restaurantFoodMenuId;
	let name = body.name;
	let detail = body.detail;
	let image = req.body.image;
	let price = body.price;
	let ageRestrictedItem = body.ageRestrictedItem ? body.ageRestrictedItem : 0
	let foodType = body.foodType;
	let variations = body.variations;
	let productTypeIds = body.productTypeIds && body.productTypeIds.length ? body.productTypeIds : [];

	let where = {
		deleteStatus: false,
		userId: userId,
		id: restaurantId,
	};

	if (req.user.roleName === "admin") {
		delete where.userId;
	} else if (req.user.roleName === "provider") {
		delete where.userId;
		where.providerId = userId;
	}
	const sequelizeTransaction = await sequelize_conn.transaction();
	Restaurant.findOne({
		where,
		include: [
			{
				model: RestaurantFoodMenu,
				where: {
					deleteStatus: false,
					id: restaurantFoodMenuId,
				},
				required: false,
				include: [
					{
						model: RestaurantMenuProduct,
						where: {
							deleteStatus: false,
							restaurantFoodMenuId: restaurantFoodMenuId,
							id: id,
						},
						required: false,
					},
				],
			},
		],
	})
		.then(async (productData) => {
			if (productData) {
				if (
					productData.restaurant_food_menus[0] &&
					productData.restaurant_food_menus[0].restaurant_menu_products &&
					productData.restaurant_food_menus[0].restaurant_menu_products.length
				) {
					let currency = productData.currency;
					let currencySymbol = productData.currencySymbol;

					let product = await RestaurantMenuProduct.findOne({
						where: {
							restaurantFoodMenuId,
							name,
							deleteStatus: false,
							[Op.not]: { id },
						},
					});
					if (product) {
						sequelizeTransaction.rollback();
						return res.status(400).send({
							message: "product already added to this menu.",
						});
					}

					let data = {
						name,
						restaurantFoodMenuId,
						detail,
						price,
						ageRestrictedItem,
						// foodType,
						currency,
						currencySymbol,
					};
					if (image) {
						data.image = image;
					}

					for (let key in data) {
						productData.restaurant_food_menus[0].restaurant_menu_products[0][
							key
						] = data[key];
					}

					// checking if Product Type not exist
					let productTypes = await ProductType.findAll({
						where: {
							id: {
								[Op.in]: productTypeIds,
							},
							deleteStatus: false,
						},
					})
					for (let i = 0; i < productTypeIds.length; i++) {
						let typeId = productTypeIds[i]
						let isTypeExist = productTypes.find(a => a.id == typeId)
						if (!isTypeExist) {
							return res.status(400).send({
								message: `Product Type id ${typeId} not found.`
							})
						}
					}

					productData.restaurant_food_menus[0].restaurant_menu_products[0]
						.save({ transaction: sequelizeTransaction })
						.then(async (postedData) => {
							try {
								await RestaurantMenuProductVariation.update(
									{ deleteStatus: true },
									{
										where: { restaurantMenuProductId: postedData.id },
										transaction: sequelizeTransaction,
									}
								);
								for (let i = 0; i < variations.length; i++) {
									let item = variations[i];
									let variation = await RestaurantMenuProductVariation.create(
										{
											name: item.name,
											restaurantMenuProductId: postedData.id,
											isMultipleSelection: item.isMultipleSelection,
											isRequired: item.isRequired,
											min: item.min,
											max: item.max,
										},
										{ transaction: sequelizeTransaction }
									);
									let variationParentId = variation.id;
									if (item.variation_products.length) {
										for (let j = 0; j < item.variation_products.length; j++) {
											console.log(item.variation_products.length);
											let variationProductItem = item.variation_products[j];
											console.log(variationProductItem);
											let postedVariationProduct =
												await VariationProduct.create(
													{
														name: variationProductItem.name,
														price: variationProductItem.price,
														variationId: variationParentId,
													},
													{ transaction: sequelizeTransaction }
												);
											console.log(postedVariationProduct);
											if (variationProductItem.variations) {
												for (
													let k = 0;
													k < variationProductItem.variations.length;
													k++
												) {
													let nestedVariationData =
														variationProductItem.variations[k];
													let nestedVariation =
														await RestaurantMenuProductVariation.create(
															{
																name: nestedVariationData.name,
																restaurantMenuProductId: postedData.id,
																isMultipleSelection:
																	nestedVariationData.isMultipleSelection,
																isRequired: nestedVariationData.isRequired,
																min: nestedVariationData.min,
																max: nestedVariationData.max,
																variationProductId: postedVariationProduct.id,
															},
															{ transaction: sequelizeTransaction }
														);
													if (nestedVariationData.variation_products.length) {
														let bulkData = [];
														nestedVariationData.variation_products.map(
															(variationProductItem) => {
																delete variationProductItem.id;
																bulkData.push({
																	...variationProductItem,
																	variationId: nestedVariation.id,
																});
															}
														);
														await VariationProduct.bulkCreate(bulkData, {
															transaction: sequelizeTransaction,
														});
													}
												}
											}
										}
									}
								}

								// updating food menu product types table
								let savedProductTypes = await FoodMenuProductType.findAll({ where: { productId: id } })
								for (let i = 0; i < savedProductTypes.length; i++) {
									let savedProductType = savedProductTypes[i]
									let index = productTypeIds.findIndex(a => a == savedProductType.productTypeId);
									if (index >= 0) {
										productTypeIds.splice(index, 1);
									} else {
										await savedProductType.destroy({ transaction: sequelizeTransaction });
									}
								}
								for (let i = 0; i < productTypeIds.length; i++) {
									let item = productTypeIds[i]
									await FoodMenuProductType.create(
										{
											productId: id,
											productTypeId: item,
										},
										{ transaction: sequelizeTransaction }
									)
								}

								await sequelizeTransaction.commit();

								let updatedData = await RestaurantMenuProduct.findOne({
									where: { id: id },
									include: [
										{
											model: ProductType,
											required: false,
											through: { attributes: [] }
										},
										{
											model: RestaurantMenuProductVariation,
											where: {
												deleteStatus: false,
												variationProductId: 0,
											},
											attributes: [
												"id",
												"name",
												"isMultipleSelection",
												"isRequired",
												"min",
												"max",
											],
											include: [
												{
													model: VariationProduct,
													where: {
														deleteStatus: false,
													},
													required: false,
													attributes: ["id", "name", "price"],
													// order: [['price', 'DESC']],
													include: [
														{
															model: RestaurantMenuProductVariation,
															where: {
																deleteStatus: false,
															},
															attributes: [
																"id",
																"name",
																"isMultipleSelection",
																"isRequired",
																"min",
																"max",
															],
															include: [
																{
																	model: VariationProduct,
																	where: {
																		deleteStatus: false,
																	},
																	required: false,
																	attributes: ["id", "name", "price"],
																	// order: [['price', 'DESC']],
																},
															],
															required: false,
															as: "child",
														},
													],
												},
											],
											required: false,
										},
									],
								});

								return res.send({
									message:
										"Restaurant Menu product has been added successfully.",
									data: updatedData,
								});
							} catch (error) {
								console.log(error);
								sequelizeTransaction.rollback();

								return res.status(500).send({
									message: "Internal Server Error.",
								});
							}
						})
						.catch((err) => {
							console.log(err);
							sequelizeTransaction.rollback();

							return res.status(500).send({
								message: "Internal Server Error.",
							});
						});
				} else {
					sequelizeTransaction.rollback();

					return res.status(400).send({
						message: "Menu not found for this restaurant.",
					});
				}
			} else {
				sequelizeTransaction.rollback();

				return res.status(400).send({
					message: "Unable to fetch data.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			sequelizeTransaction.rollback();

			return res.status(500).send({
				message: "Internal Server Error.",
			});
		});
};

exports.post = async function (req, res) {
	let userId = req.user.id;
	let restaurantId = req.body.restaurantId;
	let restaurantFoodMenuId = req.body.restaurantFoodMenuId;
	let name = req.body.name;
	let detail = req.body.detail;
	let image = req.body.image;
	let price = req.body.price;
	let ageRestrictedItem = req.body.ageRestrictedItem ? req.body.ageRestrictedItem : 0
	let foodType = req.body.foodType;
	let productTypeIds = req.body.productTypeIds && req.body.productTypeIds.length ? req.body.productTypeIds : [];

	let where = {
		deleteStatus: false,
		userId: userId,
		id: restaurantId,
	};

	if (req.user.roles[0].roleName === "admin") {
		delete where.userId;
	}

	Restaurant.findOne({
		where,
		include: [
			{
				model: RestaurantFoodMenu,
				where: {
					deleteStatus: false,
					id: restaurantFoodMenuId,
				},
				required: false,
			},
		],
	})
		.then(async (item) => {
			if (item) {
				if (
					item &&
					item.restaurant_food_menus &&
					item.restaurant_food_menus.length
				) {
					let currency = item.currency;
					let currencySymbol = item.currencySymbol;

					let restaurantFoodMenuData = await RestaurantFoodMenu.findOne({
						where: {
							id: restaurantFoodMenuId,
							name: 'Popular',
							restaurantId: restaurantId,
							deleteStatus: false
						},
						attributes: ["id"]
					})
					if(restaurantFoodMenuData){
						let restaurantMenuProductsList = await RestaurantMenuProduct.findAll({
							where: {
								restaurantFoodMenuId: restaurantFoodMenuData.id,
								deleteStatus: false,
							}
						})
	
						if (restaurantMenuProductsList && restaurantMenuProductsList.length > 5) {
							return res.status(400).send({
								message: "Cannot add more then 6 items in popular category.",
							});
						}
					}

					let product = await RestaurantMenuProduct.findOne({
						where: { restaurantFoodMenuId, name },
					});
					if (product) {
						return res.status(400).send({
							message: "product already added to this menu.",
						});
					}

					let data = {
						name,
						restaurantFoodMenuId,
						detail,
						image,
						price,
						ageRestrictedItem,
						// foodType,
						currency,
						currencySymbol,
					};

					// checking if Product Type not exist
					let productTypes = await ProductType.findAll({
						where: {
							id: {
								[Op.in]: productTypeIds,
							},
							deleteStatus: false,
						},
					})
					for (let i = 0; i < productTypeIds.length; i++) {
						let typeId = productTypeIds[i]
						let isTypeExist = productTypes.find(a => a.id == typeId)
						if (!isTypeExist) {
							return res.status(400).send({
								message: `Product Type id ${typeId} not found.`
							})
						}
					}

					let itemData = new RestaurantMenuProduct(data);

					itemData
						.save()
						.then(async (postedData) => {

							// add Product Type Ids to food menu product type table
							for (let i = 0; i < productTypeIds.length; i++) {
								let item = productTypeIds[i]
								await FoodMenuProductType.create({
									productId: postedData.id,
									productTypeId: item,
								})
							}

							let foodMenuProductData = await RestaurantMenuProduct.findOne({
								where: {
									id: postedData.id
								},
								include: [
									{
										model: ProductType,
										through: { attributes: [] },
										where: {
											deleteStatus: false,
										},
										required: false,
									},
								]
							});

							return res.send({
								message: "Restaurant Menu product has been added successfully.",
								data: foodMenuProductData,
							});
						})
						.catch((err) => {
							console.log(err);
							return res.status(500).send({
								message: "Internal Server Error.",
							});
						});
				} else {
					return res.status(400).send({
						message: "Menu not found for this restaurant.",
					});
				}
			} else {
				return res.status(400).send({
					message: "Unable to fetch data.",
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
	let restaurantId = req.body.restaurantId;
	let restaurantFoodMenuId = req.body.restaurantFoodMenuId;
	let name = req.body.name;
	let detail = req.body.detail;
	let image = req.body.image;
	let price = req.body.price;
	let ageRestrictedItem = req.body.ageRestrictedItem ? req.body.ageRestrictedItem : 0
	let foodType = req.body.foodType;
	let productTypeIds = req.body.productTypeIds && req.body.productTypeIds.length ? req.body.productTypeIds : [];

	let where = {
		deleteStatus: false,
		userId: userId,
		id: restaurantId,
	};

	if (req.user.roles[0].roleName === "admin") {
		delete where.userId;
	}

	Restaurant.findOne({
		where,
		include: [
			{
				model: RestaurantFoodMenu,
				where: {
					deleteStatus: false,
					id: restaurantFoodMenuId,
				},
				required: false,
				include: [
					{
						model: RestaurantMenuProduct,
						where: {
							deleteStatus: false,
							restaurantFoodMenuId: restaurantFoodMenuId,
							id: id,
						},
						required: false,
					},
				],
			},
		],
	})
		.then(async (item) => {
			if (item) {
				if (
					item &&
					item.restaurant_food_menus &&
					item.restaurant_food_menus.length
				) {
					let currency = item.currency;
					let currencySymbol = item.currencySymbol;
					console.log(item.restaurant_food_menus[0]);
					if (
						item.restaurant_food_menus[0] &&
						item.restaurant_food_menus[0].restaurant_menu_products &&
						item.restaurant_food_menus[0].restaurant_menu_products.length
					) {
						let product = await RestaurantMenuProduct.findOne({
							where: { restaurantFoodMenuId, name, [Op.not]: { id } },
						});
						if (product) {
							return res.status(400).send({
								message: "product already added to this menu.",
							});
						}

						let data = {
							name,
							restaurantFoodMenuId,
							detail,
							price,
							ageRestrictedItem,
							// foodType,
							currency,
							currencySymbol,
						};
						if (req.body.image) {
							data.image = image;
						}

						for (let key in data) {
							item.restaurant_food_menus[0].restaurant_menu_products[0][key] =
								data[key];
						}

						// checking if Product Type not exist
						let productTypes = await ProductType.findAll({
							where: {
								id: {
									[Op.in]: productTypeIds,
								},
								deleteStatus: false,
							},
						})
						for (let i = 0; i < productTypeIds.length; i++) {
							let typeId = productTypeIds[i]
							let isTypeExist = productTypes.find(a => a.id == typeId)
							if (!isTypeExist) {
								return res.status(400).send({
									message: `Product Type id ${typeId} not found.`
								})
							}
						}

						item.restaurant_food_menus[0].restaurant_menu_products[0]
							.save()
							.then(async (postedData) => {

								// updating food menu product types table
								let savedProductTypes = await FoodMenuProductType.findAll({ where: { productId: id } })
								for (let i = 0; i < savedProductTypes.length; i++) {
									let savedProductType = savedProductTypes[i]
									let index = productTypeIds.findIndex(a => a == savedProductType.productTypeId);
									if (index >= 0) {
										productTypeIds.splice(index, 1);
									} else {
										await savedProductType.destroy();
									}
								}
								for (let i = 0; i < productTypeIds.length; i++) {
									let item = productTypeIds[i]
									await FoodMenuProductType.create({
										productId: id,
										productTypeId: item,
									})
								}

								let foodMenuProductData = await RestaurantMenuProduct.findOne({
									where: {
										id: id
									},
									include: [
										{
											model: ProductType,
											through: { attributes: [] },
											where: {
												deleteStatus: false,
											},
											required: false,
										},
									]
								});

								return res.send({
									message:
										"Restaurant Menu product has been updated successfully.",
									data: foodMenuProductData,
								});
							})
							.catch((err) => {
								console.log(err);
								return res.status(500).send({
									message: "Internal Server Error.",
								});
							});
					} else {
						return res.status(400).send({
							message: "Menu product not found for this restaurant.",
						});
					}
				} else {
					return res.status(400).send({
						message: "Menu not found for this restaurant.",
					});
				}
			} else {
				return res.status(400).send({
					message: "Unable to fetch data.",
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

exports.updateAvailability = async function (req, res) {
	let userId = req.user.id;
	let id = req.body.id;
	let restaurantId = req.body.restaurantId;
	let restaurantFoodMenuId = req.body.restaurantFoodMenuId;
	let isAvailable = req.body.isAvailable;

	let where = {
		deleteStatus: false,
		userId: userId,
		id: restaurantId,
	};

	if (req.user.roles[0].roleName === "admin") {
		delete where.userId;
	}

	if (req.user.roles[0].roleName === "provider") {
		delete where.userId;
		where.providerId = userId;
	}

	Restaurant.findOne({
		where,
		include: [
			{
				model: RestaurantFoodMenu,
				where: {
					deleteStatus: false,
					id: restaurantFoodMenuId,
				},
				required: false,
				include: [
					{
						model: RestaurantMenuProduct,
						where: {
							deleteStatus: false,
							restaurantFoodMenuId: restaurantFoodMenuId,
							id: id,
						},
						required: false,
					},
				],
			},
		],
	})
		.then((item) => {
			if (item) {
				if (
					item &&
					item.restaurant_food_menus &&
					item.restaurant_food_menus.length
				) {
					if (
						item.restaurant_food_menus[0] &&
						item.restaurant_food_menus[0].restaurant_menu_products &&
						item.restaurant_food_menus[0].restaurant_menu_products.length
					) {
						item.restaurant_food_menus[0].restaurant_menu_products[0].isAvailable =
							isAvailable;

						item.restaurant_food_menus[0].restaurant_menu_products[0]
							.save()
							.then(async (postedData) => {
								return res.send({
									message:
										"Restaurant Menu product availability has been updated successfully.",
									data: postedData,
								});
							})
							.catch((err) => {
								console.log(err);
								return res.status(500).send({
									message: "Internal Server Error.",
								});
							});
					} else {
						return res.status(400).send({
							message: "Menu product not found for this restaurant.",
						});
					}
				} else {
					return res.status(400).send({
						message: "Menu not found for this restaurant.",
					});
				}
			} else {
				return res.status(400).send({
					message: "Unable to fetch data.",
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
	console.log(req.body);
	let userId = req.user.id;
	let id = req.params.id;
	let restaurantId = req.query.restaurantId;
	let restaurantFoodMenuId = req.query.restaurantFoodMenuId;

	let where = {
		deleteStatus: false,
		userId: userId,
		id: restaurantId,
	};

	if (req.user.roles[0].roleName === "admin") {
		delete where.userId;
	} else if (req.user.roles[0].roleName === "provider") {
		delete where.userId;
		where.providerId = req.user.id
	}

	Restaurant.findOne({
		where,
		include: [
			{
				model: RestaurantFoodMenu,
				where: {
					deleteStatus: false,
					id: restaurantFoodMenuId,
				},
				required: false,
				include: [
					{
						model: RestaurantMenuProduct,
						where: {
							deleteStatus: false,
							restaurantFoodMenuId: restaurantFoodMenuId,
							id: id,
						},
						required: false,
					},
				],
			},
		],
	})
		.then((item) => {
			if (item) {
				if (
					item &&
					item.restaurant_food_menus &&
					item.restaurant_food_menus.length
				) {
					console.log(item.restaurant_food_menus[0]);
					if (
						item.restaurant_food_menus[0] &&
						item.restaurant_food_menus[0].restaurant_menu_products &&
						item.restaurant_food_menus[0].restaurant_menu_products.length
					) {
						item.restaurant_food_menus[0].restaurant_menu_products[0].deleteStatus = true;
						item.restaurant_food_menus[0].restaurant_menu_products[0]
							.save()
							.then(async (postedData) => {
								return res.send({
									message:
										"Restaurant Menu product has been deleted successfully.",
								});
							})
							.catch((err) => {
								console.log(err);
								return res.status(500).send({
									message: "Internal Server Error.",
								});
							});
					} else {
						return res.status(400).send({
							message: "Menu product not found for this restaurant.",
						});
					}
				} else {
					return res.status(400).send({
						message: "Menu not found for this restaurant.",
					});
				}
			} else {
				return res.status(400).send({
					message: "Unable to fetch data.",
				});
			}
		}).catch((err) => {
			console.log(err);
			return res.status(500).send({
				message: "Internal Server Error.",
			});
		});
};
