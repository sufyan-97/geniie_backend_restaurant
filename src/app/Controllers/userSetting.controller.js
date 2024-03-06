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

var UserSetting = require('../SqlModels/UserSetting');

// helpers
const general_helper = require('../../helpers/general_helper');

// Constants
const constants = require('../../../config/constants');
const app_constants = require('../Constants/app.constants');


exports.getAll = async function (req, res) {

    let userId = req.query.restaurantUserId

    UserSetting.findAll({
        where:
        {
            userId: userId,
            slug: 'allow_my_rider'
        },

    }).then(data => {
        if (data && data.length) {

            return res.send({
                message: 'User Settings data fetched successfully.',
                userSetting: data[0]
            })

        } else {
            return res.status(200).send({
                message: 'Unable to fetch user setting.',
                userSetting: {
                    "status": false
                }
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.update = async function (req, res) {

    let status = req.body.status

    UserSetting.findOne({
        where: {
            userId: req.user.id
        },
    }).then(async data => {
        // if (data) {
        if (data) {

            data.status = status
            data.save()
            // UserNotificationSetting.update({ value: req.body.value })
        } else {
            let userSetting = new UserSetting({
                userId: req.user.id,
                status: status,
                slug: 'allow_my_rider'
            })
            await userSetting.save()
        }

        return res.send({
            message: 'User Settings has been updated successfully.',
            userSetting: {
                status: status
            }
        })

        // } else {
        //     return res.status(400).send({
        //         message: 'Unable to fetch user setting. User Settings not found.',
        //     })
        // }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}
