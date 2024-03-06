// Libraries


// Models
const { Restaurant } = require("../app/SqlModels/Restaurant");
const RestaurantFoodMenu = require("../app/SqlModels/RestaurantFoodMenu");
const RestaurantMenuProduct = require("../app/SqlModels/RestaurantMenuProduct");
const RestaurantMenuProductVariation = require("../app/SqlModels/RestaurantMenuProductVariation");
const VariationProduct = require("../app/SqlModels/VariationProduct");
// const Invoice = require('../app/SqlModels/Invoice')
// const Currency = require('../app/SqlModels/Currency');

// Helpers
const general_helper = require("./general_helper");

module.exports = {
    addRestaurant: function (approvalData) {
        return new Promise(async (resolve, reject) => {
            return resolve(approvalData)
        })
    },
    updateRestaurant: function (approvalData) {
        // console.log(approvalData)
        return new Promise(async (resolve, reject) => {
            try {
                let restaurantData = await Restaurant.findOne({
                    where: {
                        id: approvalData.id
                    }
                })
                if (!restaurantData) {
                    return reject({
                        message: 'Restaurant not found'
                    })
                }
                await restaurantData.update(approvalData)

                let restDashboardCards = await restaurantData.getDashboardCard()

                if (approvalData.dashboardCardIds && approvalData.dashboardCardIds.length) {
                    if (restDashboardCards && restDashboardCards.length) {
                        restDashboardCards.map(item => {
                            if (dashboardCardIds.includes(item.id)) {
                                dashboardCardIds = dashboardCardIds.filter(item => item != item.dashboardCardId)
                            } else {
                                restaurantData.removeDashboardCard(item.id)
                            }
                        })
                    }
                    restaurantData.addDashboardCard(dashboardCardIds)

                } else {
                    restaurantData.removeDashboardCards()
                }

                for (let i = 0; i < restaurantData.restaurant_types.length; i++) {
                    restaurantData.restaurant_types[i].destroy()
                }

                let types = []
                if (Array.isArray(approvalData.restaurant_types)) {
                    types = approvalData.restaurant_types
                } else {
                    types = general_helper.IsValidJSONString(approvalData.restaurant_types)
                }

                if (types && types.length) {
                    for (let i = 0; i < types.length; i++) {
                        await RestaurantType.create({ name: types[i], restaurantId: approvalData.id })
                    }
                }

                let updatedRestaurant = await Restaurant.findOne({
                    where: {
                        [Op.and]: [
                            {
                                id: approvalData.id
                            },
                            {
                                deleteStatus: false
                            }
                        ]
                    },
                    include: [
                        {
                            model: RestaurantType,
                            attributes: ['id', 'name'],
                            required: false
                        }
                    ]
                })

                return resolve({
                    data: updatedRestaurant
                })
            } catch (error) {
                console.log(error)
                return reject(error)
            }
        })

    },

    addFoodMenu: function (approvalData) {
        return new Promise(async (resolve, reject) => {
            return resolve(approvalData)
        })
    },
    updateFoodMenu: function (approvalData) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!approvalData.restaurantId) {
                    return reject({
                        message: "Error: incorrect data"
                    })
                }
                let restaurant = await Restaurant.findOne({
                    where: {
                        id: approvalData.restaurantId
                    },
                    include: [
                        {
                            model: RestaurantFoodMenu,
                            where: {
                                deleteStatus: false,
                                id: approvalData.id
                            },
                            required: false
                        }
                    ]
                })
                if (!restaurant) {
                    return reject({
                        message: 'Unable to update menu item. Restaurant not found.',
                    })
                }

                if (restaurant.restaurant_food_menus && restaurant.restaurant_food_menus.length) {
                    let alreadyAddedData = await RestaurantFoodMenu.findOne({
                        where: {
                            deleteStatus: false,
                            restaurantId: restaurantId,
                            name: name
                        }
                    })
                    if (alreadyAddedData) {
                        return reject({
                            message: 'Menu Name already added for this restaurant successfully.'
                        })
                    }
                    restaurant.restaurant_food_menus[0].name = name
                    await restaurant.restaurant_food_menus[0].save()
                    return resolve({
                        message: 'Restaurant Menu item has been updated successfully.',
                    })
                } else {
                    return reject({
                        message: 'Unable to update menu item. Menu Item not found.',
                    })
                }

            } catch (error) {
                console.log(error)
                return reject(error)
            }
        })
    },
    addFoodMenuProduct: function (approvalData) {
        return new Promise(async (resolve, reject) => {
            return resolve(approvalData)
        })
    },

    /**
     * 
     * @param {*} approvalData 
     * @returns
     * @pending should be transactional 
     */
    updateFoodMenuProduct: function (approvalData) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!approvalData.restaurantId) {
                    return reject({
                        message: "Error: incorrect data"
                    })
                }
                let productData = await Restaurant.findOne({
                    where: {
                        id: approvalData.restaurantId
                    },
                    include: [
                        {
                            model: RestaurantFoodMenu,
                            where: {
                                deleteStatus: false,
                                id: approvalData.restaurantFoodMenuId,
                            },
                            required: false,
                            include: [
                                {
                                    model: RestaurantMenuProduct,
                                    where: {
                                        deleteStatus: false,
                                        restaurantFoodMenuId: restaurantFoodMenuId,
                                        id: approvalData.id,
                                    },
                                    required: false,
                                },
                            ],
                        },
                    ],
                })

                if (!productData) {
                    return reject({
                        message: 'Error: food menu data not found'
                    })
                }

                let menuProductData = {
                    name: approvalData.name,
                    restaurantFoodMenuId: approvalData.restaurantFoodMenuId,
                    detail: approvalData.detail,
                    price: approvalData.price,
                    foodType: approvalData.foodType,
                    currency: approvalData.currency,
                    currencySymbol: approvalData.currencySymbol
                }
                if (image) {
                    menuProductData.image = approvalData.image
                }



                for (let key in menuProductData) {
                    productData.restaurant_food_menus[0].restaurant_menu_products[0][key] = menuProductData[key]
                }

                let postedData = await productData.restaurant_food_menus[0].restaurant_menu_products[0].save()

                await RestaurantMenuProductVariation.update({ deleteStatus: true }, { where: { restaurantMenuProductId: postedData.id } })
                
                for (let i = 0; i < variations.length; i++) {
                    let item = variations[i]
                    let variation = await RestaurantMenuProductVariation.create({
                        name: item.name,
                        restaurantMenuProductId: postedData.id,
                        isMultipleSelection: item.isMultipleSelection,
                        isRequired: item.isRequired,
                        min: item.min,
                        max: item.max
                    }, {  })
                    let variationParentId = variation.id
                    if (item.variation_products.length) {
                        for (let j = 0; j < item.variation_products.length; j++) {
                            console.log(item.variation_products.length);
                            let variationProductItem = item.variation_products[j]
                            console.log(variationProductItem);
                            let postedVariationProduct = await VariationProduct.create({ name: variationProductItem.name, price: variationProductItem.price, variationId: variationParentId }, {  })
                            console.log(postedVariationProduct);
                            if (variationProductItem.variations) {
                                for (let k = 0; k < variationProductItem.variations.length; k++) {
                                    let nestedVariationData = variationProductItem.variations[k]
                                    let nestedVariation = await RestaurantMenuProductVariation.create({
                                        name: nestedVariationData.name,
                                        restaurantMenuProductId: postedData.id,
                                        isMultipleSelection: nestedVariationData.isMultipleSelection,
                                        isRequired: nestedVariationData.isRequired,
                                        min: nestedVariationData.min,
                                        max: nestedVariationData.max,
                                        variationProductId: postedVariationProduct.id
                                    }, {  })
                                    if (nestedVariationData.variation_products.length) {
                                        let bulkData = []
                                        nestedVariationData.variation_products.map(variationProductItem => { delete variationProductItem.id; bulkData.push({ ...variationProductItem, variationId: nestedVariation.id }) })
                                        await VariationProduct.bulkCreate(bulkData, {  })
                                    }
                                }
                            }
                        }
                    }
                }
                return resolve(postedData)
            } catch (error) {
                console.log(error)
                return reject(error)
            }
        })
    }

}

