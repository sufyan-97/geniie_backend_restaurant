const { check, body, param, query } = require('express-validator');

exports.post = [

    body('restaurantId')
        .notEmpty()
        .isString(),

    body('restaurantFoodMenuId')
        .notEmpty()
        .isString(),

    body('restaurantMenuProductId')
        .notEmpty()
        .isString(),

    body('name')
        .notEmpty()
        .isString(),

    body('variation_products')
        .notEmpty().
        isArray(),

    body('variationProductId')
        .optional()
        .isInt(),

    // body('price')
    //     .notEmpty()
    //     .isInt(),

    // body('currency')
    //     .notEmpty()
    //     .isString(),

    // body('currencySymbol')
    //     .notEmpty()
    //     .isString(),
];

exports.update = [

    body('id')
        .notEmpty()
        .isInt(),

    body('restaurantId')
        .notEmpty()
        .isString(),

    body('restaurantFoodMenuId')
        .notEmpty()
        .isString(),

    body('restaurantMenuProductId')
        .notEmpty()
        .isString(),

    body('name')
        .notEmpty()
        .isString(),

    body('variation_products')
        .notEmpty()
        .isArray(),

    body('variationProductId')
        .optional()
        .isInt(),


    // body('price')
    //     .notEmpty()
    //     .isInt(),

    // body('currency')
    //     .notEmpty()
    //     .isString(),

    // body('currencySymbol')
    //     .notEmpty()
    //     .isString(),
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

    query('restaurantId')
        .notEmpty()
        .isInt(),

    query('restaurantFoodMenuId')
        .notEmpty()
        .isInt(),

    query('restaurantMenuProductId')
        .notEmpty()
        .isInt(),

];
