//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// libraries
var fs = require("fs");
var path = require("path");
const bcrypt = require("bcrypt");
const generator = require("generate-password");
const sequelize = require("sequelize");

const { Op } = require("sequelize");

// Config

// Custom Libraries

// Modals
// var Favourite = require('../SqlModels/favourite');
var { Restaurant, Favourite } = require("../SqlModels/Restaurant");

// helpers
const general_helper = require("../../helpers/general_helper");

// Constants
const constants = require("../../../config/constants");
const app_constants = require("../Constants/app.constants");
const DashboardCard = require("../SqlModels/dashboardCard");
const RestaurantType = require("../SqlModels/RestaurantTypes");
const Review = require("../SqlModels/Review");
// const { APP_SECRET } = require('../../../config/constants');

exports.getAll = async function (req, res) {
	let size = req.query.size ? Number(req.query.size) : 10;
	let pageNo = req.query.pageNo ? Number(req.query.pageNo) : 1;
	let lat = req.query.lat ? Number(req.query.lat) : 1;
	let long = req.query.long ? Number(req.query.long) : 1;
	let offset = 0;
	if (pageNo > 1) {
		offset = size * pageNo - size;
	}
	let pagination = {};
	pagination.limit = size;
	pagination.offset = offset;

	DashboardCard.findAll({
		where: {
			deleteStatus: false,
		},
		attributes: ["id", "name", "slug"],
		order: ["id"],
		include: [
			{
				model: Favourite,
				where: {
					userId: req.user.id,
				},
				// ...pagination,
				required: false,
				include: [
					{
						model: Restaurant,
						include: [
							{
								model: RestaurantType,
								attributes: ["name"],
								required: false,
							},
						],
					},
				],
			},
		],
	})
		.then(async (data) => {
			if (data && data.length) {
				let dataToSend = [];
				for (let i = 0; i < data.length; i++) {
					let item = data[i];
					item = item.toJSON();
					for (let j = 0; j < item.favourites.length; j++) {
						let record = item.favourites[j];
						let reviewRecord = await Review.findOne({
							where: {
								restaurantId: item.favourites[j].restaurant.id,
							},
							attributes: [
								[sequelize.fn("AVG", sequelize.col("foodStars")), "rating"],
								[sequelize.fn("count", sequelize.col("id")), "total_ratings"],
							],
						});
						let distance = general_helper.getDistanceFromLatLonInKm(
							lat,
							long,
							item.favourites[j].restaurant.latitude,
							item.favourites[j].restaurant.longitude
						);
						let distanceRoundValue = parseFloat(distance).toFixed(1);
						if (parseFloat(distanceRoundValue) < 0.05) {
							distanceRoundValue = "50 m";
						} else if (Number(distanceRoundValue) < 1) {
							distanceRoundValue = distanceRoundValue * 1000 + " m";
						} else {
							distanceRoundValue = distanceRoundValue + " miles";
						}
						item.favourites[j].restaurant.away_distance = distanceRoundValue;
						reviewRecord = reviewRecord.toJSON();
						item.favourites[j].restaurant.rating = reviewRecord.rating
							? Number(Number(reviewRecord.rating).toFixed(2))
							: 5.0;
						item.favourites[j].restaurant.total_ratings =
							reviewRecord.total_ratings
								? Number(reviewRecord.total_ratings)
								: 1;
					}
					dataToSend.push(item);
				}
				return res.send({
					message: "Favourites data fetched successfully.",
					data: dataToSend,
				});
			} else {
				return res.status(400).send({
					message: "Unable to fetch Favourites. Favourites not found.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

exports.getOne = async function (req, res) {
	let id = req.params.id;

	Favourite.findOne({
		where: {
			[Op.and]: [
				{
					id: id,
				},
				{
					userId: req.user.id,
				},
			],
		},
		include: Restaurant,
	})
		.then((data) => {
			if (data) {
				return res.send({
					message: "Favourite data fetched successfully.",
					data: data,
				});
			} else {
				return res.status(400).send({
					message: "Unable to fetch Favourite. Favourite not found.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};

exports.post = async function (req, res) {
	try {
		let restaurantId = req.body.restaurantId;
		let dashboardCardId = req.body.dashboardCardId;
	
		let dashboardCardData = await DashboardCard.findOne({
			where: { id: dashboardCardId, deleteStatus: false },
		});
		if (!dashboardCardData) {
			return res.status(400).send({
				message: "Unable to fetch dashboard card.",
			});
		}
	
		let favoriteData = await Favourite.findOne({
			where: {
				restaurantId: restaurantId,
				dashboardCardId: dashboardCardId,
				userId: req.user.id,
			},
		})
		
		if (favoriteData) {
			return res.status(400).send({
				message: "Restaurant is already marked as favourite.",
			});
		}

		let restaurantData =  await Restaurant.findOne({
			where: {
				id: restaurantId,
				deleteStatus: false,
			},
		})

		if (restaurantData) {
			let favourite = new Favourite({
				restaurantId: restaurantId,
				userId: req.user.id,
				dashboardCardId: dashboardCardId,
			});
			await favourite.save();
			
			return res.send({
				message:
					"Restaurant has been marked as favourite successfully.",
			});
		} else {
			return res.status(400).send({
				message: "Unable to fetch restaurant. Restaurant not found.",
			});
		}
	} catch (error) {
		console.log(error);
		return respondWithError(req, res, '', null, 500);
	}
};

exports.delete = async function (req, res) {
	let id = req.params.id;
	let dashboardCardId = req.query.dashboardCardId;

	let dashboardCardData = await DashboardCard.findOne({
		where: { id: dashboardCardId, deleteStatus: false },
	});
	if (!dashboardCardData) {
		return res.status(400).send({
			message: "Unable to fetch dashboard card.",
		});
	}

	Favourite.destroy({
		where: {
			restaurantId: id,
			dashboardCardId: dashboardCardId,
		},
	})
		.then((data) => {
			console.log(data);
			if (data) {
				return res.send({
					message: "Restaurant has been unmarked from favourite successfully.",
				});
			} else {
				return res.status(400).send({
					message:
						"Unable to unmarked from favourite. Favourite restaurant not found.",
				});
			}
		})
		.catch((err) => {
			console.log(err);
			return respondWithError(req, res, '', null, 500);
		});
};
