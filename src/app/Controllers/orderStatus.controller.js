//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

const { Op } = require('sequelize')

// Modals
var OrderStatus = require('../SqlModels/OrderStatus');
const DashboardCard = require('../SqlModels/dashboardCard');

exports.getAll = async function (req, res) {
    OrderStatus.findAll({
        where:
        {
            deleteStatus: false
        },
        order: [['sortOrder', 'ASC']]
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Data fetched successfully.',
                data: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch data. OrderStatuses not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.getOne = async function (req, res) {
    let id = req.params.id
    OrderStatus.findOne({
        where: {
            id: id,
            deleteStatus: false
        }
    }).then(data => {
        if (data) {
            return res.send({
                message: 'Data fetched successfully.',
                data: data
            })
        } else {
            return res.status(400).send({
                message: 'Unable to fetch data. OrderStatus not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.getOrderStatusByType = async function (req, res) {
    try {
        
        let whereClause = { deleteStatus: false }
        if (req.query.type == 'order') {
            whereClause.slug = {
                [Op.in]: ['delivery', 'pick-up'],
            }
        } else {
            whereClause.slug = 'dine-in'
        }

        let orderStatus = await OrderStatus.findAll({
            where: {
                deleteStatus: false,
            },
            attributes: ['id', 'name', 'slug'],
            include: [
                {
                    model: DashboardCard,
                    where: whereClause,
                    attributes: [],
                    required: true,
                    through: { attributes: [] },
                }
            ]
        })

        return respondWithSuccess(req, res, 'data fetched successfully', orderStatus)

    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500)
    }
}


exports.post = async function (req, res) {

    let orderStatus = new OrderStatus({
        image: req.body.image,
        name: req.body.name,
        detail: req.body.detail ? req.body.detail : '',
        slug: req.body.slug
    })

    orderStatus.save().then(async data => {
        let createdData = await OrderStatus.findOne({
            where: {
                id: data.id
            }
        })
        return res.send({
            message: 'Order Status has been added successfully.',
            data: createdData
        })
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.update = async function (req, res) {


    let updateData = {
        id: req.body.id,
    }
    let bodyKeys = Object.keys(req.body)
    if (bodyKeys.length) {
        bodyKeys.map(item => {
            if (item != 'slug')
                updateData[item] = req.body[item]
        })
    }
    OrderStatus.update(updateData, {
        where: {
            id: req.body.id,
            deleteStatus: false

        },
    }).then(async data => {
        if (data && data[0]) {

            let updatedData = await OrderStatus.findOne({
                where: {
                    id: req.body.id
                }
            })

            return res.send({
                message: 'Order status has been updated successfully.',
                data: updatedData
            })
        } else {
            return res.status(400).send({
                message: 'Unable to update data. Order Status not found.',
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}

exports.delete = async function (req, res) {
    let id = req.params.id

    OrderStatus.update({ deleteStatus: true }, {
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
