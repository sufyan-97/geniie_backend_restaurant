//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// libraries
const { Op } = require('sequelize')

// Modals
var ProductType = require('../SqlModels/ProductType');


exports.getAll = async function (req, res) {

    let additionalCheck = {}
    if (req.user.roles[0].roleName != 'admin') {
        additionalCheck.isActive = true
    }

    ProductType.findAll({
        where: {
            deleteStatus: false,
            ...additionalCheck
        },
    }).then(productTypes => {
        if (productTypes && productTypes.length) {
            return res.send({
                message: 'data fetched successfully.',
                data: productTypes
            })
        } else {
            return res.send({
                message: 'Unable to fetch data. data not found.',
                data: []
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.getOne = async function (req, res) {
    let id = req.params.id
    ProductType.findOne({
        where: {
            [Op.and]: [
                {
                    id: id
                },
                {
                    deleteStatus: false
                },
                {
                    isActive: true
                }
            ]
        }
    }).then(data => {
        if (data) {
            return res.send({
                message: 'data fetched successfully.',
                address: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch data. data not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.post = async function (req, res) {

    let payload = req.body.match;

    try {

        if (req.user.roles[0].roleName != 'admin') {
            return res.status(405).send({
                message: 'Error: method not allowed',
            })
        }

        let isProductTypeExist = await ProductType.findOne({ where: { deleteStatus: false, name: payload.name } })
        if (isProductTypeExist) {
            return res.status(400).send({
                message: 'product type already exist.',
            })
        }

        let postData = new ProductType(payload)

        await postData.save()

        return res.send({
            message: 'data has been added successfully.',
            data: postData
        })

    } catch (error) {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    }
}

exports.update = async function (req, res) {

    let payload = req.body.match;

    if (req.user.roles[0].roleName != 'admin') {
        return res.status(405).send({
            message: 'Error: method not allowed',
        })
    }

    let isProductTypeExist = await ProductType.findOne({ where: { deleteStatus: false, name: payload.name, [Op.not]: { id: payload.id } } })
    if (isProductTypeExist) {
        return res.status(400).send({
            message: 'product type already exist.',
        })
    }

    ProductType.findOne({
        where: {
            deleteStatus: false,
            id: payload.id
        }
    }).then(productTypeData => {
        if (!productTypeData) {
            return res.status(400).send({
                message: 'product type Not Found.',
            })
        }
        productTypeData.name = payload.name
        if (payload.isActive == 'false' || payload.isActive == 0 || payload.isActive == 'true' || payload.isActive == 1) {
            productTypeData.isActive = payload.isActive
        }

        productTypeData.save().then((data) => {
            return res.send({
                message: 'product type has been Updated successfully.',
                data: data
            })

        }).catch(err => {
            console.log("err:", err);
            return respondWithError(req, res, '', null, 500)
        })
    }).catch(err => {
        console.log("err:", err);
        return respondWithError(req, res, '', null, 500)
    })

}

exports.delete = async function (req, res) {
    let id = req.params.id

    if (req.user.roles[0].roleName != 'admin') {
        return res.status(405).send({
            message: 'Error: method not allowed',
        })
    }

    ProductType.update({ deleteStatus: true }, {
        where: {
            id: id
        },
    }).then(data => {
        if (data && data[0]) {
            return res.send({
                message: 'data has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete data. data not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}