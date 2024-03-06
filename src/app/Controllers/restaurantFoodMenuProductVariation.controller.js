//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')


const { Op, where } = require('sequelize')
// Modals
const RestaurantFoodMenu = require('../SqlModels/RestaurantFoodMenu');
const { Restaurant } = require('../SqlModels/Restaurant');
const RestaurantMenuProduct = require('../SqlModels/RestaurantMenuProduct');
const RestaurantMenuProductVariation = require('../SqlModels/RestaurantMenuProductVariation');

// helpers
const general_helper = require('../../helpers/general_helper');
const VariationProduct = require('../SqlModels/VariationProduct');



exports.getAll = async function (req, res) {
    // console.log(req.query);
    let restaurantId = req.query.restaurantId
    let restaurantMenuProductId = req.query.restaurantMenuProductId
    // console.log(restaurantMenuProductId);
    Restaurant.findOne({
        where: {
            // userId: userId,
            id: restaurantId,
            deleteStatus: false
        }
    }).then(item => {
        if (item) {

            RestaurantMenuProduct.findOne({
                where: {
                    deleteStatus: false,
                    id: restaurantMenuProductId
                },
                required: false,
                include: [
                    {
                        model: RestaurantMenuProductVariation,
                        where: {
                            deleteStatus: false,
                            variationProductId: 0
                        },
                        attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max', 'variationProductId'],
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
                                attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max', 'variationProductId'],
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
                    }
                ]
            }).then(data => {
                if (data) {

                    return res.send({
                        message: 'Data fetched successfully.',
                        data: data.restaurant_menu_product_variations
                    })
                } else {
                    return res.status(200).send({
                        message: 'Unable to fetch data.',
                        data: []
                    })
                }
            }).catch(err => {
                console.log(err);
                return respondWithError(req, res, '', null, 500)
            })
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

exports.post = async function (req, res) {
    let userId = req.user.id
    let restaurantId = req.body.restaurantId
    let restaurantFoodMenuId = req.body.restaurantFoodMenuId
    let restaurantMenuProductId = req.body.restaurantMenuProductId
    let isMultipleSelection = req.body.isMultipleSelection
    let isRequired = req.body.isRequired
    let name = req.body.name
    let products = req.body.variation_products
    let variationProductId = req.body.variationProductId
    let min = req.body.min
    let max = req.body.max

    let data = {
        name,
        restaurantMenuProductId,
        isMultipleSelection,
        isRequired,
        min,
        max
    }

    if (variationProductId) {
        data.variationProductId = variationProductId ? variationProductId : 0;
        let parentData = await VariationProduct.findOne({ where: { id: variationProductId, deleteStatus: false } })
        if (!parentData) {
            return res.status(400).send({
                message: 'Parent variation data not found.'
            })
        }
    }

    let where = {
        deleteStatus: false,
        userId: userId,
        id: restaurantId
    }

    if (req.user.roles[0].roleName === 'admin') {
        delete where.userId
    }


    Restaurant.findOne({
        where,
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

                    // if()

                    let itemData = new RestaurantMenuProductVariation(data)

                    itemData.save().then(async postedData => {
                        if (products) {
                            for (let i = 0; i < products.length; i++) {
                                let item = products[i]
                                await VariationProduct.create({
                                    variationId: postedData.id,
                                    name: item.name,
                                    price: item.price
                                })
                            }
                        }
                        console.log('postedData =>', postedData);

                        RestaurantMenuProductVariation.findOne({
                            where: {
                                deleteStatus: false,
                                id: postedData.id
                            },
                            attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max', 'variationProductId'],
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
                                    attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max', 'variationProductId'],
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
                        }).then(variationProductData => {
                            if (variationProductData) {
                                // console.log('variationProductData =>>>', variationProductData.restaurant_menu_product_variations);
                                return res.send({
                                    message: 'Restaurant Menu product variation has been added successfully.',
                                    data: variationProductData
                                })
                            } else {
                                return res.send({
                                    message: 'Restaurant Menu product variation has been added successfully.',
                                    data: {}
                                })
                            }
                        })
                    }).catch(err => {
                        console.log(err);
                        return respondWithError(req, res, '', null, 500);
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
        return respondWithError(req, res, '', null, 500);
    })

}

exports.update = async function (req, res) {
    // console.log(req.body);
    // let userId = req.user.id
    let restaurantId = req.body.restaurantId
    let restaurantFoodMenuId = req.body.restaurantFoodMenuId
    let restaurantMenuProductId = req.body.restaurantMenuProductId

    let id = req.body.id
    let isMultipleSelection = req.body.isMultipleSelection
    let isRequired = req.body.isRequired
    let name = req.body.name
    let min = req.body.min
    let max = req.body.max
    let variation_products = req.body.variation_products
    let variationProductId = req.body.variationProductId

    let where = {
        deleteStatus: false,
        // userId: userId,
        id: restaurantId
    }

    // if (req.user.roles[0].roleName === 'admin') {
    //     delete where.userId
    // }

    Restaurant.findOne({
        where,
        include: [
            {
                model: RestaurantFoodMenu,
                where: {
                    deleteStatus: false,
                    id: restaurantFoodMenuId
                },
                // required: false,
                include: [
                    {
                        model: RestaurantMenuProduct,
                        where: {
                            deleteStatus: false,
                            id: restaurantMenuProductId
                        },
                        include: [
                            {
                                model: RestaurantMenuProductVariation,
                                where: {
                                    id: id,
                                    deleteStatus: false
                                }
                            }
                        ],
                        // required: false,
                    }
                ]
            }
        ]
    }).then(async (item) => {
        if (item) {
            let menu = item.restaurant_food_menus
            if (item && menu && menu.length) {
                let menuProduct = menu[0].restaurant_menu_products
                if (menu[0] && menuProduct && menuProduct.length) {
                    let menuProductVariations = menuProduct[0].restaurant_menu_product_variations

                    if (variationProductId) {
                        let variationProduct = await VariationProduct.findOne({ where: { id: variationProductId, deleteStatus: false } });
                        if (!variationProduct)
                            return res.status(400).send({
                                message: 'variation product not found.',
                            })
                    }
                    if (menuProductVariations && menuProductVariations.length) {
                        let data = {
                            id,
                            name,
                            isRequired,
                            isMultipleSelection,
                            min,
                            max,
                            variationProductId,
                        }

                        for (let key in data) {
                            if (data[key])
                                menuProductVariations[0][key] = data[key]
                        }
                        menuProductVariations[0].save().then(async postedData => {
                            let savedVariationProducts = await VariationProduct.findAll({ where: { variationId: id, deleteStatus: false } });
                            let bulkCreateProd = []
                            for (var i = 0; i < savedVariationProducts.length; i++) {
                                let savedVariationProd = savedVariationProducts[i];
                                let prod = variation_products.find(a => a?.id == savedVariationProd.id);
                                if (!prod) {
                                    await savedVariationProd.destroy();
                                    console.log('destroy=>', savedVariationProd.id, 'index=>', i);
                                }
                                else {
                                    savedVariationProd.name = prod.name
                                    savedVariationProd.price = prod.price
                                    console.log('update=>', savedVariationProd.id, 'index=>', i);
                                    await savedVariationProd.save();
                                }
                            }
                            bulkCreateProd = variation_products.filter(a => !a?.id).slice()
                            bulkCreateProd = bulkCreateProd.map(element => {
                                element.variationId = id
                                return element
                            })
                            await VariationProduct.bulkCreate(bulkCreateProd)
                            let returnData = null;
                            if (variationProductId) {
                                returnData = await RestaurantMenuProductVariation.findOne({
                                    where: {
                                        id
                                    },
                                    attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max', 'variationProductId'],
                                    include: [{
                                        model: VariationProduct,
                                        attributes: ['id', 'name', 'price'],
                                    }]
                                });
                            }
                            else {
                                returnData = await RestaurantMenuProductVariation.findOne({
                                    where: {
                                        id
                                    },
                                    attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max', 'variationProductId'],
                                    include: [{
                                        model: VariationProduct,
                                        attributes: ['id', 'name', 'price'],
                                        include: [{
                                            model: RestaurantMenuProductVariation,
                                            attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max', 'variationProductId'],
                                            include: [{
                                                model: VariationProduct,
                                                attributes: ['id', 'name', 'price'],
                                            }],
                                            as: 'child'
                                        }]
                                    }]
                                });
                            }
                            return res.send({
                                message: 'Restaurant Menu product Variation has been updated successfully.',
                                data: returnData,
                                // data1: menuProductVariations[0],
                                // bulkCreateProd
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
        return respondWithError(req, res, '', null, 500);
    })
}

exports.delete = async function (req, res) {
    console.log(req.body);
    let userId = req.user.id
    let id = req.params.id
    let restaurantId = req.query.restaurantId
    let restaurantFoodMenuId = req.query.restaurantFoodMenuId
    let restaurantMenuProductId = req.query.restaurantMenuProductId

    let where = {
        deleteStatus: false,
        userId: userId,
        id: restaurantId
    }

    if (req.user.roles[0].roleName === 'admin') {
        delete where.userId
    }

    Restaurant.findOne({
        where,
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
                                model: RestaurantMenuProductVariation,
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
        return respondWithError(req, res, '', null, 500);
    })
}




