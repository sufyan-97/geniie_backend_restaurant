const { check, body, param, query } = require("express-validator");

exports.put = [
	body("action")
		.notEmpty()
		.isIn(["accepted", "declined", "ready", "picked"]),

	body("id")
		.notEmpty()
		.isInt(),

	body("deliveryTime")
		.notEmpty()
		.isString()
		.optional(),

	body('rejectionReason')
		.notEmpty()
		.isString()
		.optional()
];

exports.adjustTime = [
	body("id").notEmpty().isInt(),

	body("deliveryTime").notEmpty().isString(),
];

exports.getAll = [query("listType").notEmpty().isIn(["new", "active", "past"])];

exports.getOne = [param("id").notEmpty().isInt()];

exports.update = [];

exports.delete = [];
