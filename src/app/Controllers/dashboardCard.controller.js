//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// libraries

const { Op } = require('sequelize')

// Config

// Custom Libraries

// Modals
var DashboardCard = require('../SqlModels/dashboardCard');

// helpers
const general_helper = require('../../helpers/general_helper');

// Constants
const app_constants = require('../Constants/app.constants');
const constants = require('../../../config/constants');

exports.getAll = async function (req, res) {
    let additionalCheck = {}
    if (req.user.is_guest_user) {
        additionalCheck.login_required = 0
    }

    DashboardCard.findAll({
        where:
        {
            deleteStatus: false,
            ...additionalCheck
        }
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Dashboard Cards data fetched successfully.',
                dashboardCards: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch dashboard card. Dashboard Cards not found.',
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
    if (req.user.is_guest_user) {
        additionalCheck.login_required = 0
    }
    DashboardCard.findAll({
        where: {
            id: id,
            deleteStatus: false,
            ...additionalCheck
        }
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Dashboard Card data fetched successfully.',
                dashboardCard: data[0]
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch dashboard card. Dashboard Card not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.post = async function (req, res) {
    let dashboardCard = new DashboardCard({
        name: req.body.name,
        description: req.body.description,
        isMain: req.body.isMain,
        image: req.body.image ? req.body.image : null,
        login_required: req.body.login_required
    })


    // if (req.files && req.files.image) {
    //     let imageData = await general_helper.uploadImage(req.files.image, 'dashboardCard')
    //     if (imageData.status) {
    //         dashboardCard.image = app_constants.FILE_PREFIX + imageData.imageName;
    //     } else {
    //         return res.status(imageData.statusCode).send({
    //             message: imageData.message
    //         })
    //     }
    // }

    dashboardCard.save().then(dashboardCardData => {
        return res.send({
            message: 'Dashboard card has been added successfully.',
            dashboardCard: dashboardCardData
        })
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.update = async function (req, res) {
    let updateData = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        isMain: req.body.isMain,
        image: req.body.image ? req.body.image : null,
        login_required: req.body.login_required
    }

    // if (req.files && req.files.image) {
    //     let imageData = await general_helper.uploadImage(req.files.image, 'dashboardCard')
    //     if (imageData.status) {
    //         updateData.image = app_constants.FILE_PREFIX + imageData.imageName;
    //     } else {
    //         return res.status(imageData.statusCode).send({
    //             message: imageData.message
    //         })
    //     }
    // }


    DashboardCard.update(updateData, {
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
    }).then(data => {
        if (data && data[0]) {
            return res.send({
                message: 'Dashboard card has been updated successfully.',
                data: updateData
            })
        } else {
            return res.status(400).send({
                message: 'Unable to update dashboard card. Dashboard card not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.delete = async function (req, res) {
    let id = req.params.id

    DashboardCard.update({ deleteStatus: true }, {
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
                message: 'Dashboard Card has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete dashboard. Dashboard Card not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}
