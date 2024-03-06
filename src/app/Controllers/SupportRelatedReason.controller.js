//Libraries
const { Op } = require('sequelize')

//Custom Libraries
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')
const rpcClient = require("../../lib/rpcClient");
const { sequelize_conn } = require("../../../config/database");

//Helpers
const general_helper = require('../../helpers/general_helper');

// Modals
var Modal = require('../SqlModels/SupportRelatedReason');
var OrderStatus = require('../SqlModels/OrderStatus');
const DashboardCard = require('../SqlModels/dashboardCard');

exports.getAll = async function (req, res) {

    try {
        let type = req.query.type
        let roleId = req.query.roleId
        let orderStatusId = req.query.orderStatusId

        let whereClause = { deleteStatus: false, roleId }
        if (type) {
            whereClause.type = type
        }

        let orderStatusWhereClause = {}
        let orderStatusRequired = false
        if (type == 'orderStatus' && orderStatusId) {
            orderStatusRequired = true
            orderStatusWhereClause.id = orderStatusId
        }

        let supportRelatedReason = await Modal.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'type', 'supportTicketRequired', 'roleId', 'orderStatusId', 'departmentId'],
            include: [
                {
                    model: OrderStatus,
                    where: orderStatusWhereClause,
                    attributes: ['id', 'name', 'slug'],
                    required: orderStatusRequired,
                }
            ]
        })

        if (supportRelatedReason && supportRelatedReason.length) {
            return respondWithSuccess(req, res, 'data fetched successfully', supportRelatedReason)
        } else {
            return respondWithSuccess(req, res, 'unable to fetch data', [])
        }

    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500)
    }
}

exports.post = async function (req, res) {
    try {
        const agentRoles = await general_helper.getAgentRoles();

        if (req.user.roleName != 'admin' && !agentRoles.includes(req.user.roleName)) {
            return respondWithError(req, res, 'invalid request', null, 405);
        }

        const message = await restrictToUpdateData(req);
        if (message) {
            return respondWithError(req, res, message, null, 400);
        }

        let supportRelatedReason = await Modal.create({
            name: req.body.name,
            type: req.body.type,
            roleId: req.body.roleId,
            orderStatusId: req.body.orderStatusId ? req.body.orderStatusId : null,
            departmentId: req.body.departmentId ? req.body.departmentId : null,
            supportTicketRequired: req.body.supportTicketRequired ? req.body.supportTicketRequired : false,
        });

        supportRelatedReason = await Modal.findOne({
            where: {
                id: supportRelatedReason.id,
            },
            attributes: ['id', 'name', 'type', 'supportTicketRequired', 'roleId', 'orderStatusId', 'departmentId'],
            include: [
                {
                    model: OrderStatus,
                    attributes: ['id', 'name', 'slug'],
                    required: false,
                }
            ]
        })

        return respondWithSuccess(req, res, 'reason saved successfully', supportRelatedReason)
    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500)
    }
}

exports.update = async function (req, res) {
    try {
        const agentRoles = await general_helper.getAgentRoles();

        if (req.user.roleName != 'admin' && !agentRoles.includes(req.user.roleName)) {
            return respondWithError(req, res, 'invalid request', null, 405);
        }

        let supportRelatedReason = await Modal.findOne({
            where: {
                id: req.body.id,
                deleteStatus: false
            }
        })
        if (!supportRelatedReason) {
            return respondWithError(req, res, 'unable to update reason, reason not found', null, 400);
        }

        const message = await restrictToUpdateData(req);
        if (message) {
            return respondWithError(req, res, message, null, 400);
        }

        let updateData = {
            name: req.body.name,
            type: req.body.type,
            roleId: req.body.roleId,
            orderStatusId: req.body.orderStatusId ? req.body.orderStatusId : null,
            departmentId: req.body.departmentId ? Number(req.body.departmentId) : null,
        }

        if (req.body.supportTicketRequired == false || req.body.supportTicketRequired) {
            updateData.supportTicketRequired = req.body.supportTicketRequired
        }

        await Modal.update(updateData, {
            where: {
                id: req.body.id
            }
        });

        supportRelatedReason = await Modal.findOne({
            where: {
                id: supportRelatedReason.id,
            },
            attributes: ['id', 'name', 'type', 'supportTicketRequired', 'roleId', 'orderStatusId', 'departmentId'],
            include: [
                {
                    model: OrderStatus,
                    attributes: ['id', 'name', 'slug'],
                    required: false,
                }
            ]
        })

        return respondWithSuccess(req, res, 'reason updated successfully', supportRelatedReason)
    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500)
    }
}

exports.delete = async function (req, res) {
    try {
        let data = await Modal.update({ deleteStatus: true }, { where: { id: req.params.id } })
        if (data && data[0]) {
            return res.send({
                message: 'reason has been deleted successfully.',
            })
        } else {
            return res.status(400).send({
                message: 'Unable to delete reason. reason not found.',
            })
        }
        return respondWithSuccess(req, res, 'unable to fetch data', [])
    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500)
    }
}

async function restrictToUpdateData(req) {
    const GetRoles = () => {
        return new Promise((resolve, reject) => {
            rpcClient.MainService.GetRoles({ status: true }, function (error, rolesData) {
                if (error) {
                    console.log(error);
                    return reject(error)
                }
                return resolve(rolesData)
            })
        })
    }

    try {
        let rolesData = await GetRoles()
        console.log(rolesData)
        let roles = rolesData ? JSON.parse(rolesData.data) : [];
        let role = roles.find(a => a.id == req.body.roleId)
        if (!role) {
            return 'role not found';
        }
    } catch (error) {
        console.log(error)
        return 'unable to get role data';
    }

    if (req.body.orderStatusId) {
        let orderStatus = await OrderStatus.findOne({
            where: {
                id: req.body.orderStatusId,
                slug: {
                    [Op.notIn]: ['pending']
                }
            },
            include: [
                {
                    model: DashboardCard,
                    where: {
                        slug: {
                            [Op.in]: ['delivery', 'pick-up']
                        }
                    },
                    through: { attributes: [] }
                }
            ]
        })
        if (!orderStatus) {
            return 'order status not found';
        }
    }

    if (req.body.departmentId) {
        const GetDepartments = () => {
            return new Promise((resolve, reject) => {
                try {
                    rpcClient.MainService.GetDepartments({}, function (error, responseData) {
                        if (error) return reject(error)
                        return resolve(responseData)
                    });
                } catch (error) {
                    return reject(error)
                }
            })
        }

        try {
            let responseData = await GetDepartments()
            console.log(responseData)
            let departments = JSON.parse(responseData.data)
            let isDepartmentExist = false;
            for (let index = 0; index < departments.length; index++) {
                const department = departments[index];
                if (department.id == req.body.departmentId) {
                    isDepartmentExist = true
                    break;
                }
            }
            if (!isDepartmentExist) {
                return 'support department not found';
            }
        } catch (error) {
            console.log(error)
            return 'unable to fetch support department';
        }
    }
    return null;
}