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

    body('products')
        .notEmpty()
        .isArray()
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

    body('products')
        .notEmpty()
        .isArray()
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
