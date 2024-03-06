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
var UserNotificationSetting = require('../SqlModels/userNotificationSetting');

// helpers
const general_helper = require('../../helpers/general_helper');

// Constants
const constants = require('../../../config/constants');
const app_constants = require('../Constants/app.constants');

exports.getAll = async function (req, res) {

    let additionalCheck = {}
    if (req.user.is_guest_user) {
        additionalCheck.login_required = 0
    }

    NotificationSetting.findAll({
        where:
        {
            deleteStatus: false,
            ...additionalCheck
        },
        include: [
            {
                model: UserNotificationSetting,
                where: {
                    userId: req.user.id
                },
                required: false
            }
        ]
    }).then(data => {
        if (data && data.length) {
            let requiredData = []
            data.map(item => {
                let itemData = {
                    id: item.id,
                    name: item.name,
                    value: false
                }
                if (item.user_notification_setting) {
                    itemData.value = item.user_notification_setting.value
                }
                requiredData.push(itemData)
            })

            return res.send({
                message: 'Notification Settings data fetched successfully.',
                notificationSettings: requiredData
            })

        } else {
            return res.status(200).send({
                message: 'Unable to fetch notification setting. Notification Settings not found.',
                notificationSettings: []
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.update = async function (req, res) {

    NotificationSetting.findOne({
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
        include: [
            {
                model: UserNotificationSetting,
                where: {
                    userId: req.user.id
                },
                required: false
            }
        ]
    }).then(async data => {
        if (data) {
            if (data.user_notification_setting) {
                data.user_notification_setting.value = req.body.value
                data.user_notification_setting.save()
                // UserNotificationSetting.update({ value: req.body.value })
            } else {
                let userNotificationSetting = new UserNotificationSetting({
                    notificationId: req.body.id,
                    userId: req.user.id,
                    value: req.body.value
                })
                await userNotificationSetting.save()
            }

            return res.send({
                message: 'Notification Settings has been updated successfully.',
            })

        } else {
            return res.status(400).send({
                message: 'Unable to fetch notification setting. Notification Settings not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}
