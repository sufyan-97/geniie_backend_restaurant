const { check, body, param, query } = require('express-validator');

exports.post = [


    body('restaurantId')
        .notEmpty()
        .isString(),

];

exports.update = [
    body('id')
        .notEmpty()
        .isInt(),

    body('restaurantId')
        .notEmpty()
        .isString(),
];

exports.getOne = [
    param('id')
        .notEmpty()
        .isString(),
];

exports.delete = [
    param('id')
        .notEmpty()
        .isInt(),
];
