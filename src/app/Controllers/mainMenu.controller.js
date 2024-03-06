//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// libraries
const { Op } = require('sequelize')

// Config

// Custom Libraries

// Modals
var MainMenuItem = require('../SqlModels/MainMenuItem');

// helpers
// const general_helper = require('../../helpers/general_helper');

// Constants
// const constants = require('../../../config/constants');
// const app_constants = require('../Constants/app.constants');
// const { APP_SECRET } = require('../../../config/constants');

exports.getAll = async function (req, res) {
    let lngCode = req.headers['language']

    let additionalCheck = {}
    if (req.user.is_guest_user) {
        additionalCheck.login_required = 0
    }

    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }
    
    MainMenuItem.findAll({
        lngCode: lngCode,
        where:{
            deleteStatus: false,
            isApp: req.isApp,
            ...additionalCheck
        },
        attributes: ['id', 'name', 'image', 'slug', 'isWebView', 'login_required','isActive'],
        order: [['sortOrder', 'ASC']]
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Menu Items data fetched successfully.',
                menusItems: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch menu items. Menu items not found.',
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
    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }
    MainMenuItem.findAll({
        where: {
            id: id,
            deleteStatus: false,
            isApp: req.isApp,
            ...additionalCheck
        },
        attributes: ['id', 'name', 'image', 'slug', 'isWebView', 'login_required','isActive'],
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
        return respondWithError(req, res, '', null, 500)
    })
}

exports.post = async function (req, res) {

    let mainMenuItem = new MainMenuItem({
        name: req.body.name,
        slug: req.body.slug,
        isWebView: req.body.isWebView,
        image: req.body.image,
        login_required: req.body.login_required,
        isApp: req.isApp,
        isActive: req.body.isActive ? req.body.isActive : 1
    })
    // if (req.files && req.files.image) {
    //     let imageData = await general_helper.uploadImage(req.files.image, 'mainMenu')
    //     if (imageData.status) {
    //         mainMenuItem.image = app_constants.FILE_PREFIX + imageData.imageName;
    //     } else {
    //         return res.status(imageData.statusCode).send({
    //             message: imageData.message
    //         })
    //     }
    // }

    mainMenuItem.save().then(mainMenuItemData => {
        return res.send({
            message: 'Menu item has been added successfully.',
            menuItem: mainMenuItemData
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
        slug: req.body.slug,
        isWebView: req.body.isWebView,
        image: req.body.image ? req.body.image : null,
        login_required: req.body.login_required,
        isApp: req.isApp
    }
    if (req.body.isActive == false || req.body.isActive) {
        updateData.isActive = req.body.isActive
    }

    MainMenuItem.update(updateData, {
        where: {
            id: req.body.id,
            deleteStatus: false,
            isApp: req.isApp
        },
    }).then(async data => {
        if (data && data[0]) {
            let updatedData = await MainMenuItem.findOne({ where: { id: req.body.id } })
            return res.send({
                message: 'Menu Item has been updated successfully.',
                updatedData: updatedData
            })
        } else {
            return res.status(400).send({
                message: 'Unable to update menu item. Menu Item not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.delete = async function (req, res) {
    let id = req.params.id

    MainMenuItem.update({ deleteStatus: true }, {
        where: {
            deleteStatus: false,
            id: id,
            isApp: req.isApp
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
        return respondWithError(req, res, '', null, 500)
    })
}
