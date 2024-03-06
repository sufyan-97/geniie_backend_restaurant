const { check, body, param, query } = require('express-validator');

exports.post = [
    body('restaurantId')
        .notEmpty()
        .isInt(),

    body('foodStars')
        .notEmpty()
        .isDecimal(),

    // body('deliveryStars')
    //     .notEmpty()
    //     .isDecimal(),

    body('comment')
        .notEmpty()
        .isString().optional(),

    body('relevantId')
        .optional()
        .notEmpty()
        .isInt(),

    body('type')
        .optional()
        .notEmpty()
        .isIn(["restaurant", "order", "booking"]),
];

exports.update = [
];

exports.delete = [
];
