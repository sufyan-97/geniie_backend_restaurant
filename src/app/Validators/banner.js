const { check, body, param, query } = require('express-validator');

exports.post = [


    body('image')
        .notEmpty()
        .isString(),

    body('heading')
        .notEmpty()
        .isString(),

    body('subHeading')
        .isString().optional(),

    body('detail')
        .isString().optional(),

    body('termAndCondition')
        .isString().optional(),

];

exports.update = [
    body('id')
        .notEmpty()
        .isInt(),

    body('image')
        .notEmpty()
        .isString().optional(),

    body('heading')
        .notEmpty()
        .isString(),

    body('subHeading')
        .isString().optional(),

    body('detail')
        .isString().optional(),

    body('termAndCondition')
        .isString().optional(),

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
