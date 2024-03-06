//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

const { Op, where } = require('sequelize')
// Modals
const RestaurantFoodMenu = require('../SqlModels/RestaurantFoodMenu');
const { Restaurant } = require('../SqlModels/Restaurant');
const RestaurantMenuProduct = require('../SqlModels/RestaurantMenuProduct');
const RestaurantMenuProductAddOn = require('../SqlModels/RestaurantMenuProductAddOn');

// helpers
const general_helper = require('../../helpers/general_helper');
const AddOnProduct = require('../SqlModels/AddOnProduct');


exports.post = async function (req, res) {
    let userId = req.user.id
    let restaurantId = req.body.restaurantId
    let restaurantFoodMenuId = req.body.restaurantFoodMenuId
    let restaurantMenuProductId = req.body.restaurantMenuProductId
    let isMultipleSelection = req.body.isMultipleSelection
    let isRequired = req.body.isRequired
    let name = req.body.name
    let products = req.body.products

    Restaurant.findOne({
        where: {
            userId: userId,
            id: restaurantId,
            deleteStatus: false
        },
        include: [
            {
                model: RestaurantFoodMenu,
                where: {
                    deleteStatus: false,
                    id: restaurantFoodMenuId
                },
                include: [{
                    model: RestaurantMenuProduct,
                    where: {
                        id: restaurantMenuProductId,
                        deleteStatus: false
                    }
                }],
                required: false,
            }
        ]
    }).then(item => {
        if (item) {
            let restaurant_food_menus = item.restaurant_food_menus
            if (item && restaurant_food_menus && restaurant_food_menus.length) {
                let restaurant_menu_products = restaurant_food_menus[0].restaurant_menu_products
                if (restaurant_menu_products && restaurant_menu_products.length) {
                    let data = {
                        name,
                        restaurantMenuProductId,
                        isMultipleSelection,
                        isRequired
                    }

                    let itemData = new RestaurantMenuProductAddOn(data)

                    itemData.save().then(async postedData => {

                        if (products) {
                            products.map(item => {
                                AddOnProduct.create({
                                    variationId: postedData.id,
                                    name: item.name,
                                    price: item.price
                                })
                            })
                        }

                        return res.send({
                            message: 'Restaurant Menu product variation has been added successfully.',
                            data: postedData
                        })

                    }).catch(err => {
                        console.log(err);
                        return respondWithError(req, res, '', null, 500)
                    })
                } else {
                    return res.status(400).send({
                        message: 'Menu product not found for this restaurant.'
                    })
                }

            } else {
                return res.status(400).send({
                    message: 'Menu not found for this restaurant.'
                })
            }
        } else {
            return res.status(400).send({
                message: 'Unable to fetch data.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })

}

exports.update = async function (req, res) {
    console.log(req.body);
    let userId = req.user.id
    let id = req.body.id
    let restaurantId = req.body.restaurantId
    let restaurantFoodMenuId = req.body.restaurantFoodMenuId
    let restaurantMenuProductId = req.body.restaurantMenuProductId
    let name = req.body.name
    let price = req.body.price
    let currency = req.body.currency
    let currencySymbol = req.body.currencySymbol

    Restaurant.findOne({
        where: {
            userId: userId,
            id: restaurantId,
            deleteStatus: false
        },
        include: [
            {
                model: RestaurantFoodMenu,
                where: {
                    deleteStatus: false,
                    id: restaurantFoodMenuId
                },
                required: false,
                include: [
                    {
                        model: RestaurantMenuProduct,
                        where: {
                            deleteStatus: false,
                            id: restaurantMenuProductId
                        },
                        include: [
                            {
                                model: RestaurantMenuProductAddOn,
                                where: {
                                    id: id,
                                    deleteStatus: false
                                }
                            }
                        ],
                        required: false,
                    }
                ]
            }
        ]
    }).then(item => {
        if (item) {
            let menu = item.restaurant_food_menus
            if (item && menu && menu.length) {
                let menuProduct = menu[0].restaurant_menu_products
                if (menu[0] && menuProduct && menuProduct.length) {
                    let menuProductVariations = menuProduct[0].restaurant_menu_product_variations
                    if (menuProductVariations && menuProductVariations.length) {
                        let data = {
                            name,
                            price,
                            currency,
                            currencySymbol
                        }

                        for (let key in data) {
                            menuProductVariations[0][key] = data[key]
                        }
                        menuProductVariations[0].save().then(async postedData => {
                            return res.send({
                                message: 'Restaurant Menu product has been updated successfully.',
                            })
                        }).catch(err => {
                            console.log(err);
                            return respondWithError(req, res, '', null, 500);
                        })
                    } else {
                        return res.status(400).send({
                            message: 'Menu product variation not found for this restaurant.'
                        })
                    }

                } else {
                    return res.status(400).send({
                        message: 'Menu product not found for this restaurant.'
                    })
                }

            } else {
                return res.status(400).send({
                    message: 'Menu not found for this restaurant.'
                })
            }
        } else {
            return res.status(400).send({
                message: 'Unable to fetch data.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.delete = async function (req, res) {
    console.log(req.body);
    let userId = req.user.id
    let id = req.params.id
    let restaurantId = req.query.restaurantId
    let restaurantFoodMenuId = req.query.restaurantFoodMenuId
    let restaurantMenuProductId = req.query.restaurantMenuProductId
    Restaurant.findOne({
        where: {
            userId: userId,
            id: restaurantId,
            deleteStatus: false
        },
        include: [
            {
                model: RestaurantFoodMenu,
                where: {
                    deleteStatus: false,
                    id: restaurantFoodMenuId
                },
                required: false,
                include: [
                    {
                        model: RestaurantMenuProduct,
                        where: {
                            deleteStatus: false,
                            id: restaurantMenuProductId
                        },
                        include: [
                            {
                                model: RestaurantMenuProductAddOn,
                                where: {
                                    id: id,
                                    deleteStatus: false
                                }
                            }
                        ],
                        required: false,
                    }
                ]
            }
        ]
    }).then(item => {
        if (item) {
            let menu = item.restaurant_food_menus
            if (item && menu && menu.length) {
                let menuProduct = menu[0].restaurant_menu_products
                if (menu[0] && menuProduct && menuProduct.length) {
                    let menuProductVariations = menuProduct[0].restaurant_menu_product_variations
                    if (menuProductVariations && menuProductVariations.length) {
                        menuProductVariations[0].deleteStatus = true
                        menuProductVariations[0].save().then(async postedData => {
                            return res.send({
                                message: 'Restaurant Menu product has been deleted successfully.',
                                data: postedData
                            })
                        }).catch(err => {
                            console.log(err);
                            return respondWithError(req, res, '', null, 500);
                        })
                    } else {
                        return res.status(400).send({
                            message: 'Menu product variation not found for this restaurant.'
                        })
                    }

                } else {
                    return res.status(400).send({
                        message: 'Menu product not found for this restaurant.'
                    })
                }

            } else {
                return res.status(400).send({
                    message: 'Menu not found for this restaurant.'
                })
            }
        } else {
            return res.status(400).send({
                message: 'Unable to fetch data.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}
