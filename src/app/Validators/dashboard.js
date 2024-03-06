const { check, body, param, query } = require('express-validator');

exports.post = [
    body('name')
        .notEmpty()
        .isString(),

    body('slug')
        .notEmpty()
        .isString(),

    body('isWebView')
        .notEmpty()
        .isBoolean(),
];

exports.update = [
    body('id')
        .notEmpty()
        .isInt(),
    body('name')
        .notEmpty()
        .isString(),

    body('slug')
        .notEmpty()
        .isString(),

    body('isWebView')
        .notEmpty()
        .isBoolean(),
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
