const { check, body, param, query } = require('express-validator');

exports.post = [
    body('image')
        .notEmpty()
        .isString(),

    body('name')
        .notEmpty()
        .isString(),

    body('detail')
        .isString().optional(),

    body('slug')
        .notEmpty()
        .isString()
];

exports.update = [
    body('id')
        .notEmpty()
        .isInt(),

    body('image')
        .notEmpty()
        .isString().optional(),

    body('name')
        .notEmpty()
        .isString(),

    body('detail')
        .isString().optional(),

    // body('slug')
    //     .notEmpty()
    //     .isString()
];

exports.getOrderStatusByType = [
    query('type')
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
