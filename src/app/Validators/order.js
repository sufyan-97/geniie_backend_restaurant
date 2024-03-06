const { check, body, param, query } = require('express-validator');

exports.post = [
    body('deliveryInstructions')
        .notEmpty()
        .isString().optional(),

    body('paymentMethodId')
        .notEmpty()
        .isInt(),

    body('deliveryAddress')
        .notEmpty()
        .isString(),

    body('paymentData')
        .isObject(),

    body('long')
        .notEmpty(),

    body('lat')
        .notEmpty(),

    body('isContactLessDelivery')
        .optional()
        .notEmpty()
        .isBoolean(),

];

exports.put = [
    body('orderStatusSlug')
        .notEmpty()
        .isString(),

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

exports.updateOrderStatus = [
    body('orderId')
        .isInt()
        .notEmpty(),

    body('orderStatusId')
        .isInt()
        .notEmpty(),

    body('reasonId')
        .isInt()
        .notEmpty(),
];

exports.updateConsumerLocation = [
    body('orderId')
        .isInt()
        .notEmpty(),

    body('lat')
        .notEmpty(),

    body('long')
        .notEmpty(),

    body('address')
        .isString()
        .notEmpty(),

    body('reasonId')
        .isInt()
        .notEmpty(),
];

exports.updateOrderDeliveryTime = [
    body('orderId')
        .isInt()
        .notEmpty(),

    body('extraTime')
        .isInt()
        .notEmpty(),

    body('reasonId')
        .isInt()
        .notEmpty(),
]
