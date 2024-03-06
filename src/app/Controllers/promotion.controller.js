// libraries
const { Op } = require('sequelize')

// Custom Libraries
const rpcClient = require('../../lib/rpcClient');

// Config
const { sequelize_conn } = require("../../../config/database");


// Modals
// var User = require('../SqlModels/MainSideMenu');
const RestaurantFoodMenu = require('../SqlModels/RestaurantFoodMenu');
const { Restaurant } = require('../SqlModels/Restaurant');
const RestaurantMenuProduct = require('../SqlModels/RestaurantMenuProduct');
const ProductType = require('../SqlModels/ProductType');
const FoodMenuProductType = require('../SqlModels/FoodMenuProductType');
const RestaurantMenuProductVariation = require('../SqlModels/RestaurantMenuProductVariation');
const VariationProduct = require('../SqlModels/VariationProduct');
const RestaurantPromotionHistory = require('../SqlModels/RestaurantPromotionHistory');

// helpers
// const general_helpers = require('../../helpers/general_helper');
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// Constants
// const constants = require('../../../config/constants');


exports.applyPromotion = async function (req, res) {
	const sequelizeTransaction = await sequelize_conn.transaction();

	try {
		let user = req.user;

		if (req.user.roleName !== "provider") {
			sequelizeTransaction.rollback()
			return res.status(400).send({
				message: "Action not allowed"
			})
		}

		let promotionId = req.body.promotionId
		let restaurantId = req.body.restaurantId

		/**
		 * Step 0: check if restaurant is available
		 */
		let restaurant = await Restaurant.findOne({
			where: {
				id: restaurantId,
				providerId: user.id,
				status: 'active',
				deleteStatus: false
			},
			transaction: sequelizeTransaction
		})

		if (!restaurant) {
			sequelizeTransaction.rollback()
			return respondWithError(req, res, 'Restaurant not found', null, 400)
		}

		/**
		 * Step 1: check if promotion is available
		 */
		rpcClient.PromotionService.getPromotion({
			promotionId: promotionId
		}, async (error, promotion) => {
			if (error) {
				console.log(error)

				sequelizeTransaction.rollback()
				return respondWithError(req, res, '', null, 500)
			}

			try {
				if (!promotion || !promotion?.data) {
					sequelizeTransaction.rollback()
					return respondWithError(req, res, 'Promotion not found', null, 400)
				}

				let parsedPromotion = JSON.parse(promotion?.data)
				if (!parsedPromotion) {
					sequelizeTransaction.rollback()
					return respondWithError(req, res, 'Invalid promotion', null, 400)
				}

				/**
				 * Step 2: check if restaurant already availed the promotion
				 */
				let checkAlreadyApplied = await RestaurantFoodMenu.findOne({
					where: {
						name: parsedPromotion.title,
						promotionId: promotionId,
						restaurantId: restaurantId,
						deleteStatus: false
					},
					transaction: sequelizeTransaction
				})

				if (checkAlreadyApplied) {
					sequelizeTransaction.rollback()

					return respondWithError(req, res, 'promotion is already applied', null, 400)
				}

				/**
				 * Step 3: restaurant is allowed in areas of given promotion
				 */

				/**
				 * Step 4: check if existing products are related to restaurant defined above
				 */


				/**
				 * Step 5: create new menu related to promotion in restaurant with the existing and new products
				 */

				let restaurantFoodMenu = new RestaurantFoodMenu({
					name: parsedPromotion.title,
					restaurantId: restaurantId,
					promotionId: promotionId,
					isFeature: true
				})
				
				await restaurantFoodMenu.save({ transaction: sequelizeTransaction })

				let productDataArray = JSON.parse(req.body?.productData);

				let restaurantFoodMenuId = restaurantFoodMenu.id;


				let productTypes = await ProductType.findAll({
					where:{
						deleteStatus: false
					},
					transaction: sequelizeTransaction
				})

				for (let h = 0; h < productDataArray.length; h++) {
					let productData = productDataArray[h];

					let variations = productData?.variations;
					let productTypeIds = productData?.productTypeIds;

					// checking if Product Type not exist

					let image = productData?.image ? productData.image : productData[productData?.name] ? productData[productData?.name] : null;

					let restaurantMenuProduct = new RestaurantMenuProduct({
						name: productData?.name,
						restaurantFoodMenuId: restaurantFoodMenuId,
						detail: productData?.detail,
						image: image,
						price: parsedPromotion.discountValue,
						currency: restaurant.currency,
						currencySymbol: restaurant.currencySymbol,
					});

					await restaurantMenuProduct.save({ transaction: sequelizeTransaction })

					let saveProductTypeIds = productTypes.filter((prodType) => {
						if (productTypeIds && productTypeIds.length && productTypeIds.includes(prodType.id)) {
							return {
								productId: restaurantMenuProduct.id,
								productTypeId: prodType.id
							}
						}
					})

					if (saveProductTypeIds && saveProductTypeIds.length) {
						await FoodMenuProductType.bulkCreate(saveProductTypeIds,{ transaction: sequelizeTransaction })
					}
					
					for (let i = 0; i < variations.length; i++) {
						let variant = variations[i];
						let variation = await RestaurantMenuProductVariation.create(
							{
								name: variant.name,
								restaurantMenuProductId: restaurantMenuProduct.id,
								isMultipleSelection: variant.isMultipleSelection,
								isRequired: variant.isRequired,
								min: variant.min,
								max: variant.max,
							},
							{ transaction: sequelizeTransaction }
						);

						let variationParentId = variation.id;

						if (variant.variation_products.length) {
							for (let j = 0; j < variant.variation_products.length; j++) {
								let variationProductItem = variant.variation_products[j];
								let postedVariationProduct = await VariationProduct.create({
									name: variationProductItem.name,
									price: 0,
									variationId: variationParentId,
								}, {
									transaction: sequelizeTransaction
								});

								if (variationProductItem.variations) {
									for (let k = 0; k < variationProductItem.variations.length; k++) {
										let nestedVariationData = variationProductItem.variations[k];
										let nestedVariation = await RestaurantMenuProductVariation.create(
											{
												name: nestedVariationData.name,
												restaurantMenuProductId: restaurantMenuProduct.id,
												isMultipleSelection: nestedVariationData.isMultipleSelection,
												isRequired: nestedVariationData.isRequired,
												min: nestedVariationData.min,
												max: nestedVariationData.max,
												variationProductId: postedVariationProduct.id,
											},
											{ transaction: sequelizeTransaction }
										);
										if (nestedVariationData.variation_products.length) {
											let bulkData = [];
											nestedVariationData.variation_products.map((variationProductItem) =>
												bulkData.push({
													name: variationProductItem.name,
													price: 0,
													variationId: nestedVariation.id,
												})
											);
											await VariationProduct.bulkCreate(bulkData, { transaction: sequelizeTransaction });
										}
									}
								}
							}
						}
					}
				}

				await RestaurantPromotionHistory.create({
					promotionId: promotionId,
					restaurantId: restaurantId,
					status: 'availed'
				}, { transaction: sequelizeTransaction });

				sequelizeTransaction.commit()
				return res.send({
					message: 'Promotion has been applied successfully.',
					// data: restaurantMenuProduct,
				});

			} catch (error) {
				console.log(error)
				sequelizeTransaction.rollback();
				return respondWithError(req, res, '', null, 500)
			}
		})
	} catch (error) {
		console.log(error)
		sequelizeTransaction.rollback();
		return respondWithError(req, res, '', null, 500)
	}
}

exports.addProduct = async function (req, res) {

}

exports.removeProduct = async function (req, res) {

}

exports.unAvail = async function (req, res) {
	const sequelizeTransaction = await sequelize_conn.transaction();

	try { 
		let user = req.user;

		if (req.user.roleName !== "provider") {
			sequelizeTransaction.rollback()
			return res.status(400).send({
				message: "Action not allowed"
			})
		}

		let promotionId = req.body.promotionId
		let restaurantId = req.body.restaurantId

		/**
		 * Step 0: check if restaurant is available
		 */
		let restaurant = await Restaurant.findOne({
			where: {
				id: restaurantId,
				providerId: user.id,
				status: 'active'
			},
			transaction: sequelizeTransaction
		})

		if (!restaurant) {
			sequelizeTransaction.rollback()
			return res.status(400).send({
				message: 'Restaurant not found'
			})
		}

		/**
		 * Step 1: check if promotion is available
		 */
		rpcClient.PromotionService.getPromotion({
			promotionId: promotionId
		}, async (error, promotion) => {
			if (error) {
				console.log(error)
				
				sequelizeTransaction.rollback()
				return respondWithError(req, res, '', null, 500)
			}

			try {
				if (!promotion || !promotion?.data) {

					sequelizeTransaction.rollback()
					return respondWithError(req, res, 'Promotion not found', null, 400)
				}
				let parsedPromotion = JSON.parse(promotion.data)

				/**
				 * Step 2: check if restaurant already un-availed the promotion
				 */

				let foodMenu = await RestaurantFoodMenu.findOne({
					where: {
						name: parsedPromotion.title,
						isFeature: true,
						deleteStatus: false
					},
					transaction: sequelizeTransaction
				})

				if (!foodMenu) {
					sequelizeTransaction.rollback()
					
					return respondWithError(req, res, `this restaurant didn't avail the given promotion.`, null, 400)
				}

				/**
				 * Step 3: delete applied promotion menu products
				 */
				foodMenu.deleteStatus = true
				await foodMenu.save({transaction: sequelizeTransaction})

				/**
				 * Step 4: delete applied promotion menu products
				 */
				 let foodMenuProducts =await RestaurantMenuProduct.findAll({
					where: {
						restaurantFoodMenuId: foodMenu.id,
						deleteStatus: false
					}
				})

				await RestaurantMenuProduct.update({
					deleteStatus: true
				}, {
					where: {
						restaurantFoodMenuId: foodMenu.id,
						deleteStatus: false
					}
				})

				
				let foodMenuProductIds = foodMenuProducts.map((product) => product.id)
				console.log('foodMenuProductIds', foodMenuProductIds)
				
				
				/**
				 * Step 5: delete applied promotion menu product variations
				 */
				
				await RestaurantMenuProductVariation.update({
					deleteStatus: true
				}, {
					where: {
						restaurantMenuProductId: foodMenuProductIds
					}
				})


				/**
				 * Step 6: delete applied promotion menu variation product
				 */
				

				await RestaurantPromotionHistory.create({
					promotionId: promotionId,
					restaurantId: restaurantId,
					status: 'un_availed'
				}, { transaction: sequelizeTransaction });

				sequelizeTransaction.commit()

				return respondWithSuccess(req, res, 'Promotion has been un-availed successfully', foodMenu, 200)

			} catch (error) {
				console.log(error)
				sequelizeTransaction.rollback();
				return respondWithError(req, res, '', null, 500)
			}
		})
	} catch (error) {
		console.log(error)
		sequelizeTransaction.rollback();
		return respondWithError(req, res, '', null, 500)
	}
}