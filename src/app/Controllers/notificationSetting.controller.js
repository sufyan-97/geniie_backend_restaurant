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
var NotificationSetting = require('../SqlModels/notificationSetting');

// helpers
const general_helper = require('../../helpers/general_helper');

// Constants
const constants = require('../../../config/constants');
const app_constants = require('../Constants/app.constants');

exports.getAll = async function (req, res) {
    let additionalCheck = {}

    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }

    NotificationSetting.findAll({
        where:
        {
            deleteStatus: false,
            ...additionalCheck
        },
        order: [['sortOrder', 'ASC']]
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Notification Settings data fetched successfully.',
                notificationSettings: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch notification setting. Notification Settings not found.',
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

    NotificationSetting.findOne({
        where: {
            // [Op.and]: [
            // {
            id: id,
            deleteStatus: false,
            ...additionalCheck
            // },
            // {
            //     deleteStatus: false
            // },
            // {
            //     ...additionalCheck
            // }
            // ]
        }
    }).then(data => {
        if (data) {
            return res.send({
                message: 'Notification Setting data fetched successfully.',
                NotificationSetting: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch notification item. Notification item not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}


exports.post = async function (req, res) {
    let name = req.body.name
    NotificationSetting.findOne({
        where: {
            [Op.and]: [
                {
                    name: name
                },
                {
                    deleteStatus: false
                }
            ]
        }
    }).then(item => {
        if (item) {
            return res.status(400).send({
                message: 'Notification Setting is already added.',
            })
        } else {
            let notificationSettingItem = new NotificationSetting({
                name: name,
                login_required: req.body.login_required,
                isActive: req.body.isActive ? req.body.isActive : 1
            })

            notificationSettingItem.save().then(notificationSettingItemData => {
                return res.send({
                    message: 'Notification Setting has been added successfully.',
                    notificationSetting: notificationSettingItemData
                })
            }).catch(err => {
                console.log(err);
                return respondWithError(req, res, '', null, 500)
            })
        }
    })
}

exports.update = async function (req, res) {

    let updateData = {
        login_required: req.body.login_required,
        name: req.body.name
    }

    if (req.body.isActive) {
        updateData.isActive = req.body.isActive
    }

    NotificationSetting.update(updateData, {
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
                message: 'Notification Setting has been updated successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to update notification setting. Notification Setting not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.delete = async function (req, res) {
    let id = req.params.id

    NotificationSetting.update({ deleteStatus: true }, {
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
                message: 'Notification Setting has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete notification setting. Notification Setting not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}
