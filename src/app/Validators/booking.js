const { check, body, param, query } = require('express-validator');

exports.post = [
	body('specialInstructions')
		.notEmpty()
		.isString().optional(),

	body('paymentMethodId')
		.notEmpty()
		.isInt(),

	body('guests')
		.notEmpty()
		.isInt(),

	body('bookingDate')
		.notEmpty()
		.isDate(),

	body('bookingTime')
		.notEmpty()
		.matches(/(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/),


	body('paymentData')
		.isObject(),

	body('long')
		.notEmpty(),

	body('lat')
		.notEmpty()

];

exports.verifyBookingTime = [
	body('bookingDate')
		.notEmpty()
		.isDate(),

	body('bookingTime')
		.notEmpty()
		.matches(/(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/)
]

exports.put = [
	body('action')
		.notEmpty()
		.isString()
		.isIn(["arrived", "cancelled"]),

	body('id')
		.notEmpty()
		.isInt()
];

exports.update = [

];

exports.delete = [
];
