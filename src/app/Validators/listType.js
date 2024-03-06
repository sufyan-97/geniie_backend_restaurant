const { check, body, param, query } = require('express-validator');

exports.post = [
    body('name')
        .notEmpty()
        .isString(),

    body('slug')
        .notEmpty()
        .isString(),
];

exports.update = [

    body('id')
        .notEmpty()
        .isInt(),

    body('name')
        .notEmpty()
        .isString()
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
];
