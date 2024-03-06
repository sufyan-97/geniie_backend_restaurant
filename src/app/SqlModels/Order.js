const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');
const randomize = require("randomatic")

const { Restaurant } = require('./Restaurant');
const OrderHistory = require('./OrderHistory')
const OrderStatus = require('./OrderStatus');
const Review = require('./Review');
// const DashboardCard = require('./dashboardCard');
// const DashboardCard = require('./dashboardCard');

const Order = sequelize_conn.define('orders', {
	id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
	userId: { type: Sequelize.INTEGER, allowNull: false },
	restaurantId: { type: Sequelize.INTEGER, allowNull: false },
	riderId: { type: Sequelize.INTEGER, allowNull: true },
	orderId: { type: Sequelize.INTEGER, allowNull: false },
	transactionId: { type: Sequelize.INTEGER, allowNull: true },
	orderSummary: { type: Sequelize.TEXT, allowNull: false },
	orderStatus: { type: Sequelize.INTEGER, allowNull: false },
	acceptedByRider: { type: Sequelize.BOOLEAN, defaultValue: false },
	isContactLessDelivery: { type: Sequelize.BOOLEAN, defaultValue: false },
	isReviewed: { type: Sequelize.BOOLEAN, defaultValue: false },
	restaurantDeliveryTime: {
		type: 'DATETIME',
		allowNull: true
	}
}, {
	timestamps: true,
	hooks: {
		afterFind: async function (order, options) {
			if (order && order.length > 0) {
				order.map(item => {
					try {
						if (item.orderSummary) {
							item.orderSummary = JSON.parse(item.orderSummary)
						}
					} catch (error) {
						console.log(error);
					}
				})
			} else if (order && Object.keys(order).length > 0) {
				try {
					if (order.orderSummary) {
						order.orderSummary = JSON.parse(order.orderSummary)
					}
				} catch (error) {
					console.log(error);
				}
			}
		},
		beforeCreate: async function (order, options) {
			let orderId = await generateOrderId()
			order.orderId = orderId
		},
	}

})

Order.belongsTo(Restaurant)
// Order.belongsTo(DashboardCard)
Order.hasOne(OrderHistory, { foreignKey: 'orderId' })

Order.belongsTo(OrderStatus, { foreignKey: 'orderStatus' })

Order.hasOne(Review, { foreignKey: 'relevantId' })

async function checkUniqueOrderId(orderId) {
	let result = await Order.findOne({ where: { orderId: orderId } });
	if (result) {
		return false
	} else {
		return true
	}
}


async function generateOrderId() {
	let orderId = `#${randomize("0", 1, { exclude: "0" })}${randomize('0', 7)}`;
	if (await checkUniqueOrderId(orderId)) {
		return orderId
	} else {
		return await generateOrderId()
	}
}

module.exports = Order;