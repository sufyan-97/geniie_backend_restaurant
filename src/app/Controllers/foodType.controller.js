//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')


const { Op } = require('sequelize')

// Modals
var Modal = require('../SqlModels/FoodType');

exports.getAll = async function (req, res) {
    Modal.findAll({
        where:
        {
            deleteStatus: false
        }
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Data fetched successfully.',
                data: data
            })
        } else {
            return res.status(200).send({
                message: 'Unable to fetch data.',
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
    Modal.findOne({
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
    }).then(data => {
        if (data) {
            return res.send({
                message: 'Data fetched successfully.',
                data: data
            })
        } else {
            return res.status(200).send({
                message: 'Unable to fetch data.',
                data: {}
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.post = async function (req, res) {
    let data = {
        name: req.body.name,
        image: req.body.image
    }


    Modal.findOne({ where: { name: req.body.name } }).then(item => {
        if (item) {
            return res.status(400).send({
                message: 'Item already added.',
            })
        } else {
            let itemData = new Modal(data)

            itemData.save().then(async postedData => {
                return res.send({
                    message: 'Food Type has been added successfully.',
                    data: postedData
                })

            }).catch(err => {
                console.log(err);
                return respondWithError(req, res, '', null, 500)
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })


}

exports.update = async function (req, res) {
    let updateData = {
        id: req.body.id,
        name: req.body.name,
    }
    let image = req.body.image

    if (image) {
        updateData.image = image
    }

    Modal.findOne({
        where: {
            name: req.body.name,
            [Op.not]: {
                id: req.body.id
            },
            deleteStatus: false

        }
    }).then(async restaurantData => {
        if (!restaurantData) {
            Modal.update(updateData, {
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
                    return res.send({
                        message: 'Data has been updated successfully.',
                        data: updateData
                    })
                } else {
                    return res.status(400).send({
                        message: 'Unable to update. Data Not found.',
                    })
                }
            }).catch(err => {
                console.log(err);
                return respondWithError(req, res, '', null, 500)
            })
        } else {
            return res.status(400).send({
                message: 'Food type is already added.Please try with other name.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.delete = async function (req, res) {
    let id = req.params.id

    Modal.update({ deleteStatus: true }, {
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
                message: 'Item has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete Item. Item not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}
