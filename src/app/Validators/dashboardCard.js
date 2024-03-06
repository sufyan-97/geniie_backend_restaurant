const { check, body, param, query } = require('express-validator');

exports.post = [
    body('name')
        .notEmpty()
        .isString(),

    body('description')
        .notEmpty()
        .isString(),

    body('isMain')
        .optional()
        .isBoolean(),

    body('login_required')
        .optional()
        .isBoolean(),
];

exports.update = [
    body('id')
        .notEmpty()
        .isInt(),

    body('name')
        .notEmpty()
        .isString(),

    body('description')
        .notEmpty()
        .isString(),

    body('isMain')
        .optional()
        .isBoolean(),

    body('login_required')
        .optional()
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
