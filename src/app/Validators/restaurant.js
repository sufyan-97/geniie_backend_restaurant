const { check, body, param, query, header } = require('express-validator');
const { arrayOfObjectWithKeys } = require('./commonValidators/validation_helpers');

exports.addRestaurant = [
    body('name')
        .notEmpty()
        .isString(),

    body('email')
        .notEmpty()
        .isEmail(),

    body('address')
        .notEmpty()
        .isString(),

    body('restaurant_types')
        .isArray(),

    body('longitude')
        .notEmpty()
        .isString(),

    body('latitude')
        .notEmpty()
        .isString(),

    body('image')
        .notEmpty()
        .isString(),

    body('coverImage')
        .notEmpty()
        .isString(),

    body('alcoholLicense')
        .notEmpty()
        .optional(),

    body('proofOfOwnership')
        .notEmpty(),

    body('photoOfShopFront')
        .notEmpty(),

    body('menu')
        .notEmpty()
        .optional(),

    body('deliveryCharges')
        .notEmpty()
        .isString(),

    body('deliveryTime')
        .notEmpty()
        .isString(),

    body('deliveryRadius')
        .notEmpty()
        .optional()
        .isString(),

    body('listTypeId')
        .notEmpty()
        .isInt().optional(),

    body('dashboardCardIds')
        .notEmpty()
        .isArray(),

    body('vatNumber').isString().optional(),

    body('specialInstructions').isString().optional(),

    body('vat').notEmpty().isInt().optional(),

    body('isVat').notEmpty().isBoolean(),

    body('sittingCapacity').notEmpty().isDecimal().optional(),

    body('menuLink').isString().optional(),

    body('fsaLink').isString().optional(),

    body('fsaId').notEmpty().isInt().optional(),

    body('fsaStatus').notEmpty().isString(),

    body('postCode').notEmpty().isString(),

    body("minDeliveryOrderPrice").notEmpty().isInt().optional(),

    body("deliveryRatePerMile").notEmpty().isNumeric().optional(),

    body("bankName").notEmpty().isString(),
    body("holderName").notEmpty().isString(),
    body("accountNumber").notEmpty().isInt(),
    body("sortCode").notEmpty().isInt(),
    body("billingAddress").notEmpty().isString(),
    body("bankPostCode").notEmpty().isString(),
    body("bankCountryId").notEmpty().isInt(),
    body("bankCityId").notEmpty().isInt(),
    body("branchOwnRiders").isBoolean(),
    body("branchOwnRidersCod").isBoolean().optional(),
    body("restaurantLink").isString(),
    body("deliveryOption").isString().optional(),
    body("deliveryRateViaOrderPrice").isString().optional(),
    body("deliveryRateViaMiles").isString().optional(),
];

exports.edit = [

    body('name').notEmpty().isString(),
    body('isOpen').notEmpty().isBoolean(),
    body('longitude').notEmpty().isDecimal(),
    body('latitude').notEmpty().isDecimal(),
    body("companyName").notEmpty().isString(),
    body("capacity").notEmpty().isString(),
    body("postCode").notEmpty().isString(),
    body("menuLink").notEmpty().isString(),
    body("fssFsaStatus").notEmpty().isString(),
    body("fssFsaId").notEmpty().isString(),
    body("fssFsaLink").notEmpty().isString(),
    body("deliveryTime").notEmpty().isString(),
    body("vat").notEmpty().isString(),
    body("cityId").notEmpty().isString(),
    body("street").notEmpty().isString(),
    body("deliveryCharges").notEmpty().isString(),
    body("deliveryRadius").notEmpty().isDecimal(),
    body("currency").notEmpty().isString(),
    body("currencySymbol").notEmpty().isString(),
    body("priceBracket").notEmpty().isString(),
    body("minDeliveryOrderPrice").notEmpty().isInt(),
    body('license').optional().isString(),
    body('menuImage').optional().isString(),
    body('alcoholLicense').optional().isString(),
    body('logo').optional().isString(),
    body('types').isArray(),
    body('servicesIds').isArray(),
    body('id').isInt(),
];

exports.editBySuperAdmin = [
    body('id')
        .isInt()
        .notEmpty(),

    body('address')
        .isString()
        .notEmpty(),

    body('latitude')
        .isString()
        .notEmpty(),

    body('longitude')
        .isString()
        .notEmpty(),
];

exports.update = [

    body('id')
        .notEmpty()
        .isInt(),

    body('name')
        .notEmpty()
        .isString(),

    body('address')
        .notEmpty()
        .isString(),

    body('restaurant_types')
        .isArray(),

    body('longitude')
        .notEmpty()
        .isString(),

    body('latitude')
        .notEmpty()
        .isString(),

    body('image')
        .notEmpty()
        .isString()
        .optional(),

    body('coverImage')
        .notEmpty()
        .isString()
        .optional(),

    body('deliveryCharges')
        .notEmpty()
        .isString(),

    body('deliveryTime')
        .notEmpty()
        .isString(),

    body('deliveryRadius')
        .notEmpty()
        .optional()
        .isString(),

    body('isOpen')
        .notEmpty()
        .isBoolean()
        .optional(),

    body('listTypeId')
        .notEmpty()
        .isInt()
        .optional(),
    body('vatNumber').isString().optional(),
    body('specialInstructions').isString().optional(),
    body('vat').notEmpty().isInt().optional(),
    body('isVat').optional().isBoolean(),
    body('sittingCapacity').notEmpty().isDecimal().optional(),
    body('menuLink').isString().optional(),
    body('fsaLink').isString().optional(),
    body('fsaId').optional(),
    body('fsaStatus').notEmpty().optional().isString(),

    body('alcoholLicense').notEmpty().optional(),
    body('proofOfOwnership').notEmpty().optional(),
    body('photoOfShopFront').notEmpty().optional(),
    body('menu').notEmpty().optional(),
    body('postCode').notEmpty().optional().isString(),

    body("restaurant_medias.logo").optional().isString(),
    body("restaurant_medias.banner").optional().isString(),
    body("restaurant_medias.alcoholLicense").optional().isString(),
    body("restaurant_medias.proofOfOwnership").optional().isString(),
    body("restaurant_medias.menu").optional().isString(),

    body("minDeliveryOrderPrice").notEmpty().isInt().optional(),

    body("deliveryRatePerMile").notEmpty().isNumeric().optional(),

    body("bankName").notEmpty().isString(),
    body("holderName").notEmpty().isString(),
    body("accountNumber").notEmpty().isInt(),
    body("sortCode").notEmpty().isInt(),
    body("billingAddress").notEmpty().isString(),
    body("bankPostCode").notEmpty().isString(),
    body("bankCountryId").notEmpty().isInt(),
    body("bankCityId").notEmpty().isInt(),
    body("branchOwnRiders").isBoolean(),
    body("branchOwnRidersCod").isBoolean().optional(),
    body("restaurantLink").isString().optional(),
    body("deliveryOption").isString().optional(),
    body("deliveryRateViaOrderPrice").isString().optional(),
    body("deliveryRateViaMiles").isString().optional(),
];

exports.getOne = [
    param('id')
        .notEmpty()
        .isInt(),

    param('restaurantListTypeId')
        .notEmpty()
        .isString(),

    query('dashboardCardId')
        .notEmpty()
        .isInt().optional(),
];

exports.getAll = [

    param('restaurantListTypeId')
        .notEmpty()
        .isString(),

    query('dashboardCardId')
        .notEmpty()
        .isInt().optional(),

    query('lat')
        .notEmpty()
        .isDecimal()
        .optional(),

    query('long')
        .notEmpty()
        .isDecimal()
        .optional(),

    query('search')
        .notEmpty()
        .isString()
        .optional(),

    query('onlyRestaurantSearch')
        .notEmpty()
        .isBoolean()
        .optional(),

    query('filter')
        .notEmpty()
        .customSanitizer((filters, { req }) => {
            console.log(filters)
            if (!filters) {
                return []
            }
            try {
                let parsedFilters = JSON.parse(filters)

                let checkFilter = arrayOfObjectWithKeys(parsedFilters, ['filterName', 'filterValue'])
                if (!checkFilter) {
                    return []
                }

                return parsedFilters;
            } catch (error) {
                console.log('parsing error:', error.message)
                return []
            }
        })
        .optional()
];

exports.delete = [
    param('id')
        .notEmpty()
        .isInt(),
];

exports.status = [

    body('id')
        .notEmpty()
        .isInt(),

    body('isOpen')
        .notEmpty()
        .isBoolean(),

    body('nextOpeningTime')
        .notEmpty()
        .isString()
        .optional(),

    body('nextOpeningType')
        .notEmpty()
        .isString()
        .optional()
];

exports.suspend = [

    header('timezone')
        .optional()
        .isString(),

    body('id')
        .notEmpty()
        .isInt(),

    body('date')
        .notEmpty()
        .optional()
        .isString(),

    body('reason')
        .notEmpty()
        .isString(),

    body('isPermanent').notEmpty().isBoolean().custom((item, { req, location, path }) => {

        if (item == false || item == 'false' || item == 0) {
            if (!req.headers['timezone'])
                return Promise.reject("timezone required")
            if (!req.body.date)
                return Promise.reject("date time required")

            return Promise.resolve(item)
        }
        else
            return Promise.resolve(item)
    }),
];

exports.changeRestaurantApproval = [
    body('approvalId')
        .notEmpty()
        .isInt(),

    body('status')
        .notEmpty()
        .isIn(['accepted', 'rejected', 'partially_rejected'])
]

exports.updateRejectionRequest = [
    body('id')
        .notEmpty()
        .isInt(),

    body('rejectedFields')
        // .notEmpty()
        .isArray(),
];
