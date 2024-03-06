//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

const { Op, Sequelize } = require("sequelize");
// Modals
var Modal = require("../SqlModels/RestaurantTiming");
var { Restaurant } = require("../SqlModels/Restaurant");

// helpers
const general_helper = require("../../helpers/general_helper");
const RestaurantTimeLap = require("../SqlModels/RestaurantTimeLaps");

exports.getAll = async function (req, res) {
	let restaurantId = req.query.restaurantId;
	Restaurant.findOne({
		where: {
			id: restaurantId,
			deleteStatus: false,
		},
		include: [
			{
				model: Modal,
				where: {
					deleteStatus: false,
				},
				required: true,
				attributes: ["id", "day"],
				include: [
					{
						model: RestaurantTimeLap,
						as: "restaurant_time_laps",
						attributes: ["id", "from", "to"],
						required: true,
					},
				],
			},
		],
		order: [
			[
				Modal,
				[
					Sequelize.literal(
						"day='Sunday',day='Saturday',day='Friday',day='Thursday',day='Wednesday',day='Tuesday',day='Monday'"
					),
				],
			],
		],
	})
		.then((item) => {
			if (item) {
				return res.send({
					message: "Data fetched successfully.",
					data: item.restaurant_timings,
				});
			} else {
				return res.status(200).send({
					message: "Unable to fetch data.",
					data: [],
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

exports.post = async function (req, res) {
	let userId = req.user.id;
	let restaurantId = req.body.restaurantId;
	let day = req.body.day;
	let timing_laps = req.body.restaurant_time_laps;
	Restaurant.findOne({
		where: {
			deleteStatus: false,
			// userId: userId,
			id: restaurantId,
		},
	})
		.then((item) => {
			if (item) {
				Modal.findOne({
					where: {
						deleteStatus: false,
						restaurantId: restaurantId,
						day: day,
					},
				})
					.then(async (data) => {
						if (data) {
							await RestaurantTimeLap.destroy({
								where: {
									restaurantTimingId: data.id,
								},
							});

							timing_laps.map((item) => {
								item.restaurantTimingId = data.id;
							});

							await RestaurantTimeLap.bulkCreate(timing_laps);

							let newData = await Modal.findOne({
								where: {
									deleteStatus: false,
									restaurantId: restaurantId,
									day: day,
								},
								include: [
									{
										model: RestaurantTimeLap,
										as: "restaurant_time_laps",
										attributes: ["id", "from", "to"],
										required: true,
									},
								],
							});

							return res.send({
								message: "Restaurant Timing item has been added successfully.",
								data: newData,
							});
						} else {
							let data = {
								day: day,
								restaurantId: restaurantId,
							};

							Modal.create(data)
								.then(async (postedData) => {
									timing_laps.map((item) => {
										item.restaurantTimingId = postedData.id;
									});
									console.log(timing_laps);
									await RestaurantTimeLap.bulkCreate(timing_laps);

									let data = await Modal.findOne({
										where: {
											deleteStatus: false,
											restaurantId: restaurantId,
											day: day,
										},
										include: [
											{
												model: RestaurantTimeLap,
												as: "restaurant_time_laps",
												attributes: ["id", "from", "to"],
												required: true,
											},
										],
									});

									return res.send({
										message:
											"Restaurant Timing item has been added successfully.",
										data: data,
									});
								})
								.catch((err) => {
									console.log(err);
									return respondWithError(req, res, '', null, 500);
								});
						}
					})
					.catch((err) => {
						console.log(err);
						return respondWithError(req, res, '', null, 500);
					});
			} else {
				return res.status(400).send({
					message: "Unable to fetch data.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

exports.update = async function (req, res) {
	let restaurantId = req.body.restaurantId;

	let timings = req.body.timings;
	console.log(req.body);
	Restaurant.findOne({
		where: {
			deleteStatus: false,
			id: restaurantId,
			[Op.or]: [
				{
					userId: req.user.id,
				},
				{ providerId: req.user.id },
			],
		},
	})
		.then(async (data) => {
			if (data) {
				await Modal.destroy({ where: { restaurantId: restaurantId } });
				for (let i = 0; i < timings.length; i++) {
					let item = timings[i];
					let data = await Modal.create({
						day: item.day,
						restaurantId: restaurantId,
					});
					if (item.restaurant_time_laps && item.restaurant_time_laps.length) {
						let time_laps = []
						item.restaurant_time_laps.map((lapItem) => {
							console.log("lapItem", lapItem)
							if (lapItem.from && lapItem.to) {
								time_laps.push({ ...lapItem, restaurantTimingId: data.id });
							}
						});
						if (time_laps && time_laps.length) {
							await RestaurantTimeLap.bulkCreate(time_laps);
						}
					}
				}

				Restaurant.findOne({
					where: {
						id: restaurantId,
						deleteStatus: false,
					},
					include: [
						{
							model: Modal,
							where: {
								deleteStatus: false,
							},
							required: true,
							attributes: ["id", "day"],
							include: [
								{
									model: RestaurantTimeLap,
									as: "restaurant_time_laps",
									attributes: ["id", "from", "to"],
								},
							],
						},
					],
					order: [
						[
							Modal,
							[
								Sequelize.literal(
									"day='Sunday',day='Saturday',day='Friday',day='Thursday',day='Wednesday',day='Tuesday',day='Monday'"
								),
							],
						],
					],
				})
					.then((item) => {
						if (item) {
							if (item) {
								return res.send({
									message: "Restaurant timing updated successfully.",
									data: item.restaurant_timings,
								});
							} else {
								return res.status(200).send({
									message: "Unable to fetch data.",
									data: [],
								});
							}
						} else {
							return res.status(400).send({
								message: "Unable to fetch data.",
							});
						}
					})
					.catch((err) => {
						console.log(err);
						return respondWithError(req, res, '', null, 500);
					});
			} else {
				return res.status(400).send({
					message: "Unable to update menu item. Restaurant not found.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

exports.delete = async function (req, res) {
	let id = req.params.id;
	let restaurantId = req.query.restaurantId;

	Restaurant.findOne({
		where: {
			deleteStatus: false,
			id: restaurantId,
		},
		include: [
			{
				model: Modal,
				where: {
					deleteStatus: false,
					id: id,
				},
				required: false,
			},
		],
	})
		.then((data) => {
			if (data) {
				if (data.restaurant_timings && data.restaurant_timings.length) {
					data.restaurant_timings[0].deleteStatus = true;
					data.restaurant_timings[0].save();
					return res.send({
						message:
							"Restaurant timing for this day has been deleted successfully.",
					});
				} else {
					return res.status(400).send({
						message: "Unable to delete timing item. Timing Item not found.",
					});
				}
			} else {
				return res.status(400).send({
					message: "Unable to delete restaurant. Restaurant not found.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};
