//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// libraries
// var fs = require('fs');
// var path = require('path');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const generator = require('generate-password');

const { Op } = require('sequelize')

// // Config

// // Custom Libraries

// Modals
var Banner = require('../SqlModels/banner');
// var { Restaurant } = require('../SqlModels/Restaurant');

// helpers
// const general_helper = require('../../helpers/general_helper');

// Constants
// const constants = require('../../../config/constants');
// const app_constants = require('../Constants/app.constants');
// const { APP_SECRET } = require('../../../config/constants');

exports.getAll = async function (req, res) {
    let additionalCheck = {}
    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }

    Banner.findAll({
        where:
        {
            deleteStatus: false,
            ...additionalCheck
        },
        // include: Restaurant
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Banners data fetched successfully.',
                banners: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch banner. Banners not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.getOne = async function (req, res) {
    let id = req.params.id
    let additionalCheck = {}

    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }

    Banner.findOne({
        where: {
            id: id,
            deleteStatus: false,
            ...additionalCheck
        },
        // include: Restaurant
    }).then(data => {
        console.log(data);
        if (data) {
            return res.send({
                message: 'Banner data fetched successfully.',
                banner: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch banner. Banner not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}


exports.post = async function (req, res) {

    // let restaurantId = req.body.restaurantId

    // Restaurant.findOne({
    //     where: {
    //         [Op.and]: [
    //             {
    //                 id: restaurantId
    //             },
    //             {
    //                 deleteStatus: false
    //             }
    //         ]
    //     }
    // }).then(async data => {
    //     if (data) {
    let banner = new Banner({
        // restaurantId: restaurantId,
        image: req.body.image ? req.body.image : null,
        heading: req.body.heading ? req.body.heading : '',
        subHeading: req.body.subHeading ? req.body.subHeading : '',
        detail: req.body.detail ? req.body.detail : '',
        termAndCondition: req.body.termAndCondition ? req.body.termAndCondition : '',
        isActive: req.body.isActive ? req.body.isActive : 1,
    })

    banner.save().then(bannerData => {
        return res.send({
            message: 'Banner has been added successfully.',
            banner: bannerData
        })
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
    // } else {
    //     return res.status(400).send({
    //         message: 'Unable to fetch restaurant. Restaurant not found.',
    //     })
    // }
    // }).catch(err => {
    //     console.log(err);
    //     return res.status(500).send({
    //         message: 'Internal Server Error.',
    //     })
    // })


}

exports.update = async function (req, res) {


    let updateData = {
        id: req.body.id,
    }
    let bodyKeys = Object.keys(req.body)
    if (bodyKeys.length) {
        bodyKeys.map(item => {
            updateData[item] = req.body[item]
        })
    }
    if (req.body.isActive == false || req.body.isActive) {
        updateData.isActive = req.body.isActive
    }

    // Restaurant.findOne({
    //     where: {
    //         [Op.and]: [
    //             {
    //                 id: req.body.restaurantId
    //             },
    //             {
    //                 deleteStatus: false
    //             }
    //         ]
    //     }
    // }).then(async data => {
    // if (data) {

    Banner.update(updateData, {
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

            let updatedData = await Banner.findOne({
                where: {
                    id: req.body.id
                },
                // include: Restaurant
            })

            return res.send({
                message: 'Banner has been updated successfully.',
                banner: updatedData
            })
        } else {
            return res.status(400).send({
                message: 'Unable to update banner. Banner not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
    // } else {
    //     return res.status(400).send({
    //         message: 'Unable to fetch restaurant. Restaurant not found.',
    //     })
    // }
    // }).catch(err => {
    //     console.log(err);
    //     return res.status(500).send({
    //         message: 'Internal Server Error.',
    //     })
    // })



}

exports.delete = async function (req, res) {
    let id = req.params.id

    Banner.update({ deleteStatus: true }, {
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
        return respondWithError(req, res, '', null, 500)
    })
}
