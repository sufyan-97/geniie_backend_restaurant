const { check, body, param, query } = require('express-validator');

exports.put = [
	body('action')
		.notEmpty()
		.isIn(['accepted', 'declined', 'ready', "completed"]),

	body('id')
		.notEmpty()
		.isInt(),

	body('rejectionReason')
		.notEmpty()
		.isString()
		.optional()
];

exports.getAll = [
	query('listType')
		.notEmpty()
		.isIn(['new', 'active', 'past']),

];

exports.getOne = [
	param('id')
		.notEmpty()
		.isInt(),

];

exports.update = [

];

exports.delete = [
];
