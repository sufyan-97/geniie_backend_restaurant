//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

const { Op } = require('sequelize')

// Modals
var Modal = require('../SqlModels/ProductNotAvailable');

// helpers
const general_helper = require('../../helpers/general_helper');


exports.getAll = async function (req, res) {
    Modal.findAll({
        where:
        {
            deleteStatus: false
        },
        order: [['sortOrder', 'ASC']]
        // attributes: ['id', 'name', ['isDefault', 'isSelected']]
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
        // attributes: ['id', 'name', ['isDefault', 'isSelected']]
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
        isSelected: req.body.isSelected
    }

    let slug = data.name.toLowerCase()
    data.slug = slug.replace(/ /g, "_")

    Modal.findOne({
        where: {
            deleteStatus: false,
            [Op.or]: [
                {
                    name: data.name,
                },
                {
                    slug: data.slug,
                }
            ]
        },
        // attributes: ['id', 'name', ['isDefault', 'isSelected']]
    }).then(item => {
        if (item) {
            return res.status(400).send({
                message: 'Data with this name already added.',
            })
        }

        let itemData = new Modal(data)

        itemData.save().then(async postedData => {
            return res.send({
                message: 'Data has been added successfully.',
                data: postedData
            })

        }).catch(err => {
            console.log(err);
            return respondWithError(req, res, '', null, 500)
        })
    })

}

exports.update = async function (req, res) {

    try {
        let updateData = {
            name: req.body.name,
            isSelected: req.body.isSelected
        }

        let slug = updateData.name.toLowerCase()
        slug = slug.replace(/ /g, "_")

        let productNotAvailable = await Modal.findOne({
            where: {
                deleteStatus: false,
                [Op.or]: [
                    {
                        name: updateData.name,
                    },
                    {
                        slug: slug,
                    }
                ],
                [Op.not]: {
                    id: req.body.id
                }
            }
        })

        if (productNotAvailable) {
            return respondWithError(req, res, 'Data with this name already exist.', null, 400)
        }

        Modal.update(updateData, {
            where: {
                id: req.body.id,
                deleteStatus: false
            },
        }).then(async data => {
            if (data && data[0]) {
                let newData = await Modal.findOne({
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
                })

                return res.send({
                    message: 'Data has been updated successfully.',
                    data: newData
                })
            } else {
                return res.status(400).send({
                    message: 'Unable to update Data.',
                })
            }
        }).catch(err => {
            console.log(err);
            return respondWithError(req, res, '', null, 500)
        })

    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500)
    }
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
                message: 'Data has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete restaurant. Data not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}
