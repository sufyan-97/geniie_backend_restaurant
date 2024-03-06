const { check, body, param, query } = require('express-validator');
// const { ObjectOfObjectWithKeys } = require('./commonValidators/validation_helpers');
// const { validate, composeValidators } = require('@sknk/object-validator');
const yup = require('yup')

const schema = yup.array().of(
	yup.object().shape({
		name: yup.string().required(),
		detail: yup.string().required(),
		// image: yup.string().optional(),
		variations: yup.array()
			.of(
				yup.object().shape({
					name: yup.string().required(),
					isMultipleSelection: yup.boolean().notRequired(),
					isRequired: yup.boolean().notRequired(),
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
			)
	})
);

exports.applyPromotion = [
	body('promotionId')
		.notEmpty()
		.isInt(),

	body('restaurantId')
		.notEmpty()
		.isInt(),

	body('productData')
		.notEmpty()
		.isString().custom((productData) => {
			try {
				let parsedProductData = JSON.parse(productData)
				let test = schema.isValidSync(parsedProductData)
				console.log(test)
				// if (!test || !test.length) {
				if (!test || !parsedProductData.length) {
					throw new Error('test failed')
				}
				return true
			} catch (error) {
				console.log(error.message)
				throw new Error(error.message);
			}
		})
];


exports.addProduct = [

]

exports.removeProduct = [

]

exports.unAvail = [
	body('promotionId')
		.notEmpty()
		.isInt(),

	body('restaurantId')
		.notEmpty()
		.isInt(),
]