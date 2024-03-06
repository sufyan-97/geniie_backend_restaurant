const { check, body, param, query, header } = require('express-validator');
const { IsValidJSONString } = require('../../helpers/general_helper');

exports.get = [
    header('geolocation')
        .isString()
        .notEmpty()
        .custom(data => {
           
            let parsedData = JSON.parse(data)
            if (IsValidJSONString(data)) {
                if (parsedData.lat && parsedData.long) {

                    return Promise.resolve();
                } else {
                    return Promise.reject('geolocation param is required');
                }
            } else {
                return Promise.reject('geolocation param is required');
            }

        })


];
exports.applyPromo = [
    header('geolocation')
        .isString()
        .notEmpty()
        .custom(data => {
          
            let parsedData = JSON.parse(data)
            if (IsValidJSONString(data)) {
                if (parsedData.lat && parsedData.long) {

                    return Promise.resolve();
                } else {
                    return Promise.reject('geolocation param is required');
                }
            } else {
                return Promise.reject('geolocation param is required');
            }

        })


];
exports.removePromo = [
    header('geolocation')
        .isString()
        .notEmpty()
        .custom(data => {
          
            let parsedData = JSON.parse(data)
            if (IsValidJSONString(data)) {
                if (parsedData.lat && parsedData.long) {

                    return Promise.resolve();
                } else {
                    return Promise.reject('geolocation param is required');
                }
            } else {
                return Promise.reject('geolocation param is required');
            }

        })


];
exports.post = [
    body('restaurantId')
        .notEmpty()
        .isInt(),

    body('foodMenuId')
        .notEmpty()
        .isInt(),

    body('productId')
        .notEmpty()
        .isInt(),

    body('quantity')
        .notEmpty()
        .isInt(),

    body('productVariationData')
        .notEmpty()
        .isArray().optional(),

    body('productNotAvailableValueId')
        .notEmpty()
        .isInt(),

    body('lat')
        .notEmpty()
        .isString()
        .optional(),

    body('long')
        .notEmpty()
        .isString()
        .optional(),
];

exports.update = [
    header('geolocation')
        .isString()
        .notEmpty()
        .custom(data => {
        
            let parsedData = JSON.parse(data)
            if (IsValidJSONString(data)) {
                if (parsedData.lat && parsedData.long) {

                    return Promise.resolve();
                } else {
                    return Promise.reject('geolocation param is required');
                }
            } else {
                return Promise.reject('geolocation param is required');
            }

        }),

    body('id')
        .notEmpty()
        .isInt(),

    body('restaurantId')
        .notEmpty()
        .isInt(),

    body('foodMenuId')
        .notEmpty()
        .isInt(),

    body('productId')
        .notEmpty()
        .isInt(),
];

exports.delete = [

    header('geolocation')
        .isString()
        .notEmpty()
        .custom(data => {
         
            let parsedData = JSON.parse(data)
            if (IsValidJSONString(data)) {
                if (parsedData.lat && parsedData.long) {

                    return Promise.resolve();
                } else {
                    return Promise.reject('geolocation param is required');
                }
            } else {
                return Promise.reject('geolocation param is required');
            }

        }),

    param('id')
        .notEmpty()
        .isString(),

];
