//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// libraries
var fs = require('fs');
var path = require('path');
const bcrypt = require('bcrypt');
const generator = require('generate-password');

const { Op } = require('sequelize')

// Config

// Custom Libraries

// Modals
var TopDeal = require('../SqlModels/topDeal');
var { Restaurant } = require('../SqlModels/Restaurant');

// helpers
const general_helper = require('../../helpers/general_helper');

// Constants
const constants = require('../../../config/constants');
const app_constants = require('../Constants/app.constants');
// const { APP_SECRET } = require('../../../config/constants');

exports.getAll = async function (req, res) {

    let size = req.query.size ? Number(req.query.size) : 10
    let pageNo = req.query.pageNo ? Number(req.query.pageNo) : 1
    let offset = 0

    if (pageNo > 1) {
        offset = size * pageNo - size
    }

    let pagination = {}
    pagination.limit = size
    pagination.offset = offset



    TopDeal.findAll({
        where:
        {
            deleteStatus: false
        },
        ...pagination,
        include: Restaurant
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Top Deals data fetched successfully.',
                topDeals: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch Top Deals. Top Deals not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.getOne = async function (req, res) {
    let id = req.params.id
    TopDeal.findOne({
        where: {
            [Op.and]: [
                {
                    id: id
                },
                {
                    deleteStatus: false
                }
            ]
        },
        include: Restaurant
    }).then(data => {
        console.log(data);
        if (data) {
            return res.send({
                message: 'Top Deals data fetched successfully.',
                topDeal: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch Top Deals. Top Deals not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}


exports.post = async function (req, res) {

    let restaurantId = req.body.restaurantId

    Restaurant.findOne({
        where: {
            [Op.and]: [
                {
                    id: restaurantId
                },
                {
                    deleteStatus: false
                }
            ]
        }
    }).then(async data => {
        if (data) {
            let topDeal = new TopDeal({
                restaurantId: restaurantId,
                image: req.body.image ? req.body.image : null
            })

            // if (req.files && req.files.image) {
            //     let imageData = await general_helper.uploadImage(req.files.image, 'banner')
            //     if (imageData.status) {
            //         banner.image = app_constants.FILE_PREFIX + imageData.imageName;
            //     } else {
            //         return res.status(imageData.statusCode).send({
            //             message: imageData.message
            //         })
            //     }
            // }

            topDeal.save().then(topDealData => {
                return res.send({
                    message: 'Top Deals has been added successfully.',
                    topDeal: topDealData
                })
            }).catch(err => {
                console.log(err);
                return respondWithError(req, res, '', null, 500);
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch Top Deals. Top Deals not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })


}

exports.update = async function (req, res) {
    let updateData = {
        id: req.body.id,
        image: req.body.image ? req.body.image : null
    }
    Restaurant.findOne({
        where: {
            [Op.and]: [
                {
                    id: req.body.restaurantId
                },
                {
                    deleteStatus: false
                }
            ]
        }
    }).then(async data => {
        if (data) {
            TopDeal.update(updateData, {
                where: {
                    [Op.and]: [
                        {
                            id: req.body.id
                        },
                        {
                            deleteStatus: false
                        }
                    ]
                },
            }).then(async data => {
                if (data && data[0]) {

                    let updatedData = await TopDeal.findOne({
                        where: {
                            id: req.body.id
                        },
                        include: Restaurant
                    })

                    return res.send({
                        message: 'Top Deal has been updated successfully.',
                        topDeal: updatedData
                    })
                } else {
                    return res.status(400).send({
                        message: 'Unable to update top deal. Top deal not found.',
                    })
                }
            }).catch(err => {
                console.log(err);
                return respondWithError(req, res, '', null, 500);
            })

        } else {
            return res.status(400).send({
                message: 'Unable to fetch restaurant. Restaurant not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.delete = async function (req, res) {
    let id = req.params.id

    TopDeal.update({ deleteStatus: true }, {
        where: {
            [Op.and]: [
                {
                    deleteStatus: false
                },
                {
                    id: id
                }
            ]
        },
    }).then(data => {
        if (data && data[0]) {
            return res.send({
                message: 'Banner has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete banner. Banner not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}
