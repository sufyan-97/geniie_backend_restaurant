// Libraries
const { check, body, param, query } = require('express-validator');
const yup = require('yup')


const postWithVariationSchema = yup.object().shape({
    restaurantId: yup.number().required(),
    restaurantFoodMenuId: yup.number().required(),
    name: yup.string().required(),
    detail: yup.string().optional(),
    price: yup.number().required(),
    ageRestrictedItem: yup.boolean().optional(),
    productTypeIds: yup.array().notRequired(),
    variations: yup.array().of(
        yup.object().shape({
            isMultipleSelection: yup.boolean().required(),
            isRequired: yup.boolean().required(),
            name: yup.string().required(),
            min: yup.number().notRequired(),
            max: yup.number().notRequired(),

            variation_products: yup.array().of(
                yup.object().shape({
                    name: yup.string().required(),
                    price: yup.number().required(),
                    variations: yup.array().of(
                        yup.object().shape({
                            isMultipleSelection: yup.boolean().notRequired(),
                            isRequired: yup.boolean().notRequired(),
                            name: yup.string().required(),
                            min: yup.number().notRequired(),
                            max: yup.number().notRequired(),

                            variation_products: yup.array().of(
                                yup.object().shape({
                                    name: yup.string().required(),
                                    price: yup.number().required(),
                                })
                            ).notRequired()

                        })
                    ).notRequired()
                })
            ).notRequired()

        })
    ).notRequired()
})

exports.postWithVariation = [
    body('data').custom((values) => {
        try {
            let productWithVariation = JSON.parse(values)
            return postWithVariationSchema.validateSync(productWithVariation)
        } catch (error) {
            console.log(error)
            return false
        }
    })
];

exports.updateWithVariation = [
    body('data').custom((values) => {
        try {
            let productWithVariation = JSON.parse(values)
            return postWithVariationSchema.validateSync(productWithVariation)
        } catch (error) {
            console.log(error)
            return false
        }
    })

];

exports.post = [

    body('restaurantId')
        .notEmpty()
        .isString(),

    body('restaurantFoodMenuId')
        .notEmpty()
        .isString(),

    body('name')
        .notEmpty()
        .isString(),

    body('detail')
        .notEmpty()
        .isString()
        .optional(),

    body('image')
        .notEmpty()
        .isString()
        .optional(),
    // body('foodType')
    //     .notEmpty()
    //     .isString(),

    body('price')
        .notEmpty()
        .isDecimal(),

    body('productTypeIds')
        .notEmpty()
        .optional()
        .isArray(),
    body('ageRestrictedItem')
        .notEmpty()
        .optional()
        .isBoolean(),
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

    body('name')
        .notEmpty()
        .isString(),

    body('detail')
        .notEmpty()
        .isString()
        .optional(),

    body('image')
        .notEmpty()
        .isString()
        .optional(),

    // body('foodType')
    //     .notEmpty()
    //     .isString(),

    body('price')
        .notEmpty()
        .isDecimal(),
    body('currency')
        .notEmpty()
        .isString(),

    body('currencySymbol')
        .notEmpty()
        .isString(),

    body('productTypeIds')
        .notEmpty()
        .optional()
        .isArray(),
    body('ageRestrictedItem')
        .notEmpty()
        .optional()
        .isBoolean(),
];

exports.updateAvailability = [

    body('id')
        .notEmpty()
        .isInt(),

    body('restaurantId')
        .notEmpty()
        .isInt(),

    body('restaurantFoodMenuId')
        .notEmpty()
        .isInt(),

    body('isAvailable')
        .notEmpty()
        .isBoolean(),
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
];
