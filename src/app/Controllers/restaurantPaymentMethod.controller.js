//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')


const { Op } = require('sequelize')
// Modals
var Modal = require('../SqlModels/RestaurantPaymentMethod');
var { Restaurant } = require('../SqlModels/Restaurant');

// helpers
const general_helper = require('../../helpers/general_helper');

exports.getAll = async function (req, res) {
    let restaurantId = req.query.restaurantId
    Restaurant.findOne({
        where: {
            id: restaurantId,
            deleteStatus: false
        },
        include: [{
            model: Modal,
            where: {
                deleteStatus: false
            },
            required: true,
            attributes: ['id', 'name', 'image'],
        }]
    }).then(item => {
        if (item) {
            if (item) {
                return res.send({
                    message: 'Data fetched successfully.',
                    data: item.restaurant_payment_methods
                })
            } else {
                return res.status(200).send({
                    message: 'Unable to fetch data.',
                    data: []
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

exports.post = async function (req, res) {
    let userId = req.user.id
    let restaurantId = req.body.restaurantId
    let name = req.body.name
    let image = req.body.image
    Restaurant.findOne({
        where: {
            deleteStatus: false,
            userId: userId,
            id: restaurantId
        }
    }).then(item => {
        if (item) {
            Modal.findOne({
                where:
                {
                    deleteStatus: false,
                    restaurantId: restaurantId,
                    name: name
                }
            }).then(data => {
                if (data) {
                    return res.status(400).send({
                        message: 'Restaurant payment method already added with this name.'
                    })
                } else {

                    let data = {
                        name: name,
                        restaurantId: restaurantId,
                        image: image
                    }

                    Modal.create(data).then(async postedData => {

                        return res.send({
                            message: 'Restaurant payment method has been added successfully.',
                            data: postedData
                        })

                    }).catch(err => {
                        console.log(err);
                        return respondWithError(req, res, '', null, 500);
                    })
                }
            }).catch(err => {
                console.log(err);
                return respondWithError(req, res, '', null, 500);
            })
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

    let restaurantId = req.body.restaurantId
    let name = req.body.name
    let image = req.body.image
    let id = req.body.id

    Restaurant.findOne({
        where: {
            deleteStatus: false,
            id: restaurantId,
            userId: req.user.id
        },
        include: [
            {
                model: Modal,
                where: {
                    deleteStatus: false,
                    id: id
                },
                required: false
            }
        ]
    }).then(async data => {
        if (data) {
            if (data.restaurant_payment_methods && data.restaurant_payment_methods.length) {
                if (name !== data.restaurant_payment_methods[0].name) {
                    let alreadyAddedData = await Modal.findOne({
                        where:
                        {
                            deleteStatus: false,
                            restaurantId: restaurantId,
                            name: name
                        }
                    })
                    if (alreadyAddedData) {
                        return res.status(400).send({
                            message: 'Restaurant timing already added for this day.'
                        })
                    }
                }

                data.restaurant_payment_methods[0].name = name
                if (image) {
                    data.restaurant_payment_methods[0].image = image
                }
                data.restaurant_payment_methods[0].save()

                return res.send({
                    message: 'Restaurant payment method has been updated successfully.',
                })


            } else {
                return res.status(400).send({
                    message: 'Unable to update menu item. Menu Item not found.',
                })
            }
        } else {
            return res.status(400).send({
                message: 'Unable to update menu item. Restaurant not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })

}

exports.delete = async function (req, res) {
    let id = req.params.id
    let restaurantId = req.query.restaurantId

    Restaurant.findOne({
        where: {
            deleteStatus: false,
            id: restaurantId
        },
        include: [
            {
                model: Modal,
                where: {
                    deleteStatus: false,
                    id: id
                },
                required: false
            }
        ]
    }).then(data => {
        if (data) {
            if (data.restaurant_payment_methods && data.restaurant_payment_methods.length) {
                data.restaurant_payment_methods[0].deleteStatus = true
                data.restaurant_payment_methods[0].save()
                return res.send({
                    message: 'Restaurant timing for this day has been deleted successfully.',
                })
            } else {
                return res.status(400).send({
                    message: 'Unable to delete timing item. Timing Item not found.',
                })
            }
        } else {
            return res.status(400).send({
                message: 'Unable to delete restaurant. Restaurant not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}
