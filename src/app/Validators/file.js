const { check, body, param, query } = require('express-validator');

exports.getOne = [
    param('fileName')
        .notEmpty()
        .isString(),
];

