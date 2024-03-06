const { check, body, param, query } = require('express-validator');

exports.post = [
    // body('deliveryInstructions')
    //     .notEmpty()
    //     .isString().optional(),

    // body('paymentMethodId')
    //     .notEmpty()
    //     .isInt(),

    // body('deliveryAddress')
    //     .notEmpty()
    //     .isString(),
];

exports.put = [
    body('orderStatusId')
        .notEmpty()
        .isString()
        .optional(),

    body('orderId')
        .notEmpty()
        .isInt(),

    body('restaurantId')
        .notEmpty()
        .isInt(),
];

exports.update = [

];

exports.delete = [
];
