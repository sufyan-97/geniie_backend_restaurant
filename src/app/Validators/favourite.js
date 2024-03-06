const { check, body, param, query } = require('express-validator');

exports.post = [
    body('restaurantId')
        .notEmpty()
        .isInt(),
    body('dashboardCardId')
        .notEmpty()
        .isInt(),
];

exports.unMark = [
    body('restaurantId')
        .notEmpty()
        .isInt(),
];

exports.getOne = [
    param('id')
        .notEmpty()
        .isInt(),
];

exports.delete = [
    param('id')
        .notEmpty()
        .isInt(),
    query('dashboardCardId')
        .notEmpty()
        .isInt(),
];
