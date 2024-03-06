const { check, body, param, query } = require('express-validator');

exports.getAll = [
    query('roleId')
        // .optional()
        .notEmpty()
        .isInt(),

    query('type')
        .optional()
        .notEmpty()
        .isIn(['orderStatus', 'location', 'orderDeliveryTime']),

    query('orderStatusId')
        .optional()
        .notEmpty()
        .isInt(),
];

exports.post = [
    body('name')
        .notEmpty()
        .isString(),

    body('type')
        .notEmpty()
        .isIn(['orderStatus', 'location', 'orderDeliveryTime']),

    body('roleId')
        .notEmpty()
        .isInt(),

    body('supportTicketRequired')
        .optional()
        .notEmpty()
        .isBoolean(),

    body('orderStatusId')
        .optional()
        .notEmpty()
        .isInt(),

    body('departmentId')
        .optional()
        .notEmpty()
        .isInt(),
];

exports.update = [
    body('id')
        .notEmpty()
        .isInt(),

    body('name')
        .notEmpty()
        .isString(),

    body('type')
        .notEmpty()
        .isIn(['orderStatus', 'location', 'orderDeliveryTime']),

    body('roleId')
        .notEmpty()
        .isInt(),

    body('supportTicketRequired')
        .optional()
        .notEmpty()
        .isBoolean(),

    body('orderStatusId')
        .optional()
        .notEmpty()
        .isInt(),

    body('departmentId')
        .optional()
        .notEmpty()
        .isInt(),
];

exports.delete = [
    param('id')
        .notEmpty()
        .isInt(),
];
