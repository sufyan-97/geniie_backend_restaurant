const { check, body, param, query } = require('express-validator');

exports.filter = [
    param('fileName')
        .notEmpty()
        .isString(),
];