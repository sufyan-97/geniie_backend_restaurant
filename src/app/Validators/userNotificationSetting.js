const { check, body, param, query } = require('express-validator');

exports.post = [
    body('name')
        .notEmpty()
        .isString(),
];

exports.update = [

    body('id')
        .notEmpty()
        .isString(),

    body('value')
        .notEmpty()
        .isBoolean(),

];