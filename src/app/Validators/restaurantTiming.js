const { check, body, param, query } = require('express-validator');

exports.post = [
	body('day')
		.notEmpty()
		.isString(),

	body('restaurant_time_laps')
		.notEmpty()
		.isArray(),

	body('restaurantId')
		.notEmpty()
		.isString(),
];

exports.update = [

	body('id')
		.notEmpty()
		.isInt(),

	body('day')
		.notEmpty()
		.isString(),

	body('restaurant_time_laps')
		.notEmpty()
		.isArray(),


	body('restaurantId')
		.notEmpty()
		.isString(),
];

exports.bulkUpdate = [


	body('timings')
		.isArray().notEmpty(),

	check('timings.*.day')
		.notEmpty()
		.isString(),

	check('timings.*.restaurant_time_laps')
		// .notEmpty()
		.isArray().optional(),

	check('timings.*.restaurant_time_laps.*.to')
		.notEmpty()
		.isString().optional(),

	check('timings.*.restaurant_time_laps.*.from')
		.notEmpty()
		.isString().optional(),

	body('restaurantId')
		.notEmpty()
		.isString(),
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
];
