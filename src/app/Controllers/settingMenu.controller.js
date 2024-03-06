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
var SettingMenuItem = require('../SqlModels/settingMenuItem');

// helpers
// const general_helper = require('../../helpers/general_helper');

// Constants
// const constants = require('../../../config/constants');
// const app_constants = require('../Constants/app.constants');

exports.getAll = async function (req, res) {
    let lngCode = req.headers['language']

    let additionalCheck = {}
    if (req.user.is_guest_user) {
        additionalCheck.login_required = 0
    }
    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }
  
    SettingMenuItem.findAll({
        lngCode: lngCode,
        where:{
            deleteStatus: false,
            ...additionalCheck
        },
        order: [['sortOrder', 'ASC']]
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Menu Item data fetched successfully.',
                menusItems: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch menu item. Menu items not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.getOne = async function (req, res) {
    let id = req.params.id
    let additionalCheck = {}
    if (req.user.is_guest_user) {
        additionalCheck.login_required = 0
    }

    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }

    SettingMenuItem.findAll({
        where: {
            id: id,
            deleteStatus: false,
            ...additionalCheck
        }
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Menu Item data fetched successfully.',
                menusItem: data[0]
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch menu item. Menu item not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}


exports.post = async function (req, res) {

    let settingMenuItem = new SettingMenuItem({
        name: req.body.name,
        slug: req.body.slug,
        isWebView: req.body.isWebView,
        image: req.body.image,
        arrowImage: req.body.arrowImage,
        login_required: req.body.login_required,
        isActive: req.body.isActive ? req.body.isActive : 1
    })

    settingMenuItem.save().then(settingMenuItemData => {
        return res.send({
            message: 'Menu item has been added successfully.',
            menuItem: settingMenuItemData
        })
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.update = async function (req, res) {
    console.log(req.body);
    let updateData = {
        id: req.body.id,
        name: req.body.name,
        slug: req.body.slug,
        isWebView: req.body.isWebView,
        login_required: req.body.login_required
    }
    if (req.body.image) {
        updateData.image = req.body.image
        updateData.arrowImage = req.body.arrowImage
    }
    if (req.body.isActive == false || req.body.isActive) {
        updateData.isActive = req.body.isActive
    }


    SettingMenuItem.update(updateData, {
        where: {
            id: req.body.id,
            deleteStatus: false
        },
    }).then(async data => {
        if (data && data[0]) {
            let updatedData = await SettingMenuItem.findOne({ where: { id: req.body.id } })
            return res.send({
                message: 'Menu Item has been updated successfully.',
                data: updatedData
            })
        } else {
            return res.status(400).send({
                message: 'Unable to update menu item. Menu Item not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}

exports.delete = async function (req, res) {
    let id = req.params.id

    SettingMenuItem.update({ deleteStatus: true }, {
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
                message: 'Menu item has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete menu item. Menu item not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500);
    })
}
