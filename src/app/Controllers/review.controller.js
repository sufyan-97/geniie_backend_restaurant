//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')


const { Op } = require('sequelize')

// Modals
var Review = require('../SqlModels/Review');
const { Restaurant } = require('../SqlModels/Restaurant');
const Order = require('../SqlModels/Order');
const Booking = require('../SqlModels/Booking');

// Custom Libraries
const rpcClient = require('../../lib/rpcClient');

// helpers
const general_helper = require('../../helpers/general_helper');
const axios = require('axios');
const { MAIN_SERVICE_URL, BASIC_AUTH_USER, BASIC_AUTH_PASSWORD } = require('../../../config/constants');


exports.getAll = async function (req, res) {

    let userId = req.user.id
    Review.findAll({
        where: {
            userId: userId
        },
        include: [{ model: Restaurant, attributes: ['id', 'name', 'image',"specialInstructions"] }]
    }).then(async reviews => {

        if (reviews && reviews.length) {
            return res.send({
                data: reviews
            })
        } else {
            return res.send({
                data: []
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.getOne = async function (req, res) {

    let id = req.params.id

    Review.findAll({
        where: {
            restaurantId: id
        },
        attributes: ['id', 'userId', 'foodStars', 'deliveryStars', 'comment', 'relevantId', 'type', 'createdAt']
    }).then(async reviews => {

        if (reviews && reviews.length) {
            let userList = reviews.map(item => item.userId)
            try {

                rpcClient.UserService.GetUsers({ ids: userList }, function (err, getUserData) {
                    if (err) {
                        console.log(err)
                        return res.status(500).send({
                            message: 'Unable to get riders this time.',
                        })
                    }

                    if (!getUserData || !getUserData.data) {
                        sequelizeTransaction.rollback()
                        return res.status(500).send({
                            message: 'Unable to get riders this time.',
                        })
                    }
                    let userRecords = JSON.parse(getUserData.data)
                    let dataToSend = []
                    reviews.map(item => {
                        let record = item.toJSON()
                        let user = userRecords.find(item => item.id === record.userId)
                        if (user) {
                            record.username = user.username
                            record.profileImage = user.profileImage
                        } else {
                            record.username = 'Anonymous'
                            record.profileImage = 'defaultProfile.png'
                        }
                        delete record.userId
                        dataToSend.push(record)
                    })

                    return res.send({
                        data: dataToSend
                    })
                })
            } catch (error) {
                console.log(error);
                return respondWithError(req, res, '', null, 500);
            }

        } else {
            return res.send({
                data: []
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.post = async function (req, res) {

    try {
        let userId = req.user.id
        let restaurantId = req.body.restaurantId
        let foodStars = req.body.foodStars
        let deliveryStars = req.body.deliveryStars
        deliveryStars = foodStars
        let comment = req.body.comment
        let relevantId = req.body.relevantId
        let type = req.body.type

        let restaurant = await Restaurant.findOne({
            where: {
                id: restaurantId
            }
        })

        if (restaurant) {

            let productData = {
                foodStars,
                deliveryStars,
                comment,
                userId,
                restaurantId,
                relevantId: restaurantId,
            }
            let newRecord = new Review(productData)

            if (type && type != 'restaurant') {
                newRecord.type = type

                if (!relevantId) {
                    return respondWithError(req, res, 'invalid data', null, 422);
                }

                // if (type == 'order') {
                //     let order = await Order.findOne({
                //         where: {
                //             id: relevantId
                //         },
                //         attributes: ['id']
                //     })

                //     if(!order){
                //         return respondWithError(req, res, 'order detail not found', null, 400);
                //     }
                // }
                // else if (type == 'booking') {
                //     let booking = await Booking.findOne({
                //         where: {
                //             id: relevantId
                //         },
                //         attributes: ['id']
                //     })

                //     if(!booking){
                //         return respondWithError(req, res, 'booking detail not found', null, 400);
                //     }
                // }

                newRecord.relevantId = relevantId
            }

            let reviewPostedData = await newRecord.save()

            if (reviewPostedData) {
                return respondWithSuccess(req, res, 'Review has been added successfully.');
            }

        } else {
            return res.send({
                data: {}
            })
        }

    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500);
    }

}

exports.update = async function (req, res) {


}

exports.delete = async function (req, res) {

}
