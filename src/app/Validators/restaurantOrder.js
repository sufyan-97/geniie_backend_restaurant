const { check, body, param, query } = require('express-validator');


exports.getAll = [
    query('frequency')
        .notEmpty()
        .isIn(['7_days', 'this_month', 'last_month', 'range']),

    query('startDate')
        .isDate()
        .notEmpty()
        .optional(),

    query('endDate')
        .isDate()
        .notEmpty()
        .optional()
]