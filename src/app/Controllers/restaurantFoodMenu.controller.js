//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')


const { Op } = require('sequelize')
// Modals
var Modal = require('../SqlModels/RestaurantFoodMenu');
var { Restaurant } = require('../SqlModels/Restaurant');
const RestaurantMenuProduct = require('../SqlModels/RestaurantMenuProduct');
const RestaurantMenuProductVariation = require('../SqlModels/RestaurantMenuProductVariation');
const RestaurantMenuProductAddOn = require('../SqlModels/RestaurantMenuProductAddOn');
const VariationProduct = require('../SqlModels/VariationProduct');
const AddOnProduct = require('../SqlModels/AddOnProduct');
const ProductType = require('../SqlModels/ProductType');

// helpers
const general_helper = require('../../helpers/general_helper');

exports.getAll = async function (req, res) {
	let userId = req.user.id
	let roleName = req.user.roles[0].roleName
	let restaurantId = req.query.restaurantId ? req.query.restaurantId : null
	if (roleName !== 'restaurant' && !restaurantId) {
		return res.status(422).send({
			message: 'Invalid Data, Restaurant id required in query',
		})
	}

	let productWhere = {
		deleteStatus: false
	}
	let restaurantWhere = {
		id: restaurantId,
		deleteStatus: false
	}

	if (roleName === 'user') {
		productWhere.isAvailable = true
	} else if (roleName === 'restaurant') {
		restaurantWhere.userId = userId
		delete restaurantWhere.id
	}

	let additionalProductTypeCheck = {}
	let productTypeAttributes = ['id', 'name']
	if (roleName != 'admin') {
		additionalProductTypeCheck.isActive = true
	} else {
		productTypeAttributes.push('isActive')
	}

	Restaurant.findOne({
		where: restaurantWhere
	}).then(item => {
		if (item) {
			Modal.findAll({
				where:
				{
					deleteStatus: false,
					restaurantId: item.id
				},
				include: [
					{
						model: RestaurantMenuProduct,
						where: productWhere,
						required: false,
						include: [
							{
								model: RestaurantMenuProductVariation,
								where: {
									deleteStatus: false,
									variationProductId: 0
								},
								attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max'],
								include: [{
									model: VariationProduct,
									where: {
										deleteStatus: false
									},
									required: false,
									attributes: ['id', 'name', 'price'],
									// order: [['price', 'DESC']],
									include: [{
										model: RestaurantMenuProductVariation,
										where: {
											deleteStatus: false
										},
										attributes: ['id', 'name', 'isMultipleSelection', 'isRequired', 'min', 'max'],
										include: [{
											model: VariationProduct,
											where: {
												deleteStatus: false
											},
											required: false,
											attributes: ['id', 'name', 'price'],
											// order: [['price', 'DESC']],
										}],
										required: false,
										as: 'child'
									}]
								}
								],
								required: false
							},
							{
								model: RestaurantMenuProductAddOn,
								where: {
									deleteStatus: false
								},
								attributes: ['id', 'name', 'isMultipleSelection', 'isRequired'],
								include: [{
									model: AddOnProduct,
									where: {
										deleteStatus: false
									},
									required: false,
									attributes: ['id', 'name', 'price'],
								}],
								required: false,
							},
							{
								model: ProductType,
								through: { attributes: [] },
								where: {
									deleteStatus: false,
									...additionalProductTypeCheck,
								},
								attributes: productTypeAttributes,
								required: false,
							}
						]
					}
				],
				order: [['id', 'asc'], [RestaurantMenuProduct, 'id', 'asc'], [RestaurantMenuProduct, RestaurantMenuProductVariation, VariationProduct, 'price', 'asc']]
			}).then(data => {
				if (data && data.length) {
					return res.send({
						message: 'Data fetched successfully.',
						data: data
					})
				} else {
					return res.status(200).send({
						message: 'Unable to fetch data.',
						data: []
					})
				}
			}).catch(err => {
				console.log(err);
				return respondWithError(req, res, '', null, 500);
			})
		} else {
			return res.status(400).send({
				message: 'Unable to fetch data.',
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500);
	})
}

exports.post = async function (req, res) {
	let userId = req.user.id
	let restaurantId = req.body.restaurantId
	let name = req.body.name

	const substring = "popular";

	const substring1 = "Popular";

	if (name.includes(substring) || name.includes(substring1)) {
		message.error('Menu category cannot have "popular" word in its name')
		return
	}

	console.log(req.user);

	let where = {
		deleteStatus: false,
		userId: userId,
		id: restaurantId
	}

	if (req.user.roles[0].roleName === 'admin') {
		delete where.userId
	} else if (req.user.roles[0].roleName === 'provider') {
		delete where.userId
		where.providerId = req.user.id
	}
	console.log(where);
	Restaurant.findOne({
		where
	}).then(item => {
		if (item) {
			Modal.findOne({
				where:
				{
					deleteStatus: false,
					restaurantId: restaurantId,
					name: name
				}
			}).then(data => {
				if (data) {
					return res.status(400).send({
						message: 'Menu Name already added for this restaurant successfully.'
					})
				} else {

					let data = {
						name: name,
						restaurantId: restaurantId
					}

					let itemData = new Modal(data)

					itemData.save().then(async postedData => {

						return res.send({
							message: 'Restaurant Menu item has been added successfully.',
							data: postedData
						})

					}).catch(err => {
						console.log(err);
						return respondWithError(req, res, '', null, 500);
					})
				}
			}).catch(err => {
				console.log(err);
				return respondWithError(req, res, '', null, 500);
			})
		} else {
			return res.status(400).send({
				message: 'Unable to fetch data.',
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500);
	})

}

exports.update = async function (req, res) {

	let restaurantId = req.body.restaurantId
	let name = req.body.name
	let id = req.body.id
	let where = {
		deleteStatus: false,
		userId: req.user.id,
		id: restaurantId
	}
	const substring = "popular";

	const substring1 = "Popular";

	if (name.includes(substring) || name.includes(substring1)) {
		message.error('Menu category cannot have "popular" word in its name')
		return
	}

	if (req.user.roles[0].roleName === 'admin') {
		delete where.userId
	} else if (req.user.roles[0].roleName === 'provider') {
		delete where.userId
		where.providerId = req.user.id
	}

	Restaurant.findOne({
		where,
		include: [
			{
				model: Modal,
				where: {
					deleteStatus: false,
					id: id
				},
				required: false
			}
		]
	}).then(data => {
		if (data) {
			if (data.restaurant_food_menus && data.restaurant_food_menus.length) {

				Modal.findOne({
					where:
					{
						deleteStatus: false,
						restaurantId: restaurantId,
						name: name,
						[Op.not]: { id },
					}
				}).then(alreadyAddedData => {
					if (alreadyAddedData) {
						return res.status(400).send({
							message: 'Menu Name already added for this restaurant successfully.'
						})
					} else {

						data.restaurant_food_menus[0].name = name
						data.restaurant_food_menus[0].save()
						return res.send({
							message: 'Restaurant Menu item has been updated successfully.',
						})
					}
				}).catch(err => {
					console.log(err);
					return respondWithError(req, res, '', null, 500);
				})


			} else {
				return res.status(400).send({
					message: 'Unable to update menu item. Menu Item not found.',
				})
			}
		} else {
			return res.status(400).send({
				message: 'Unable to update menu item. Restaurant not found.',
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500);
	})

}

exports.delete = async function (req, res) {
	let id = req.params.id
	let restaurantId = req.query.restaurantId




	Restaurant.findOne({
		where: {
			deleteStatus: false,
			id: restaurantId
		},
		include: [
			{
				model: Modal,
				where: {
					deleteStatus: false,
					id: id
				},
				required: false
			}
		]
	}).then(data => {
		if (data) {
			if (data.restaurant_food_menus && data.restaurant_food_menus.length) {
				data.restaurant_food_menus[0].deleteStatus = true
				data.restaurant_food_menus[0].save()
				return res.send({
					message: 'Restaurant has been deleted successfully.',
				})
			} else {
				return res.status(400).send({
					message: 'Unable to delete menu item. Menu Item not found.',
				})
			}
		} else {
			return res.status(400).send({
				message: 'Unable to delete restaurant. Restaurant not found.',
			})
		}
	}).catch(err => {
		console.log(err);
		return respondWithError(req, res, '', null, 500);
	})
}
