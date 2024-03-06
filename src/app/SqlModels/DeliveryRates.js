const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const DeliveryRates = sequelize_conn.define('delivery_rates', {
	id: { type: Sequelize.INTEGER,primaryKey: true,autoIncrement: true},
	restaurantId: { type: Sequelize.INTEGER, allowNull: false },
	type: {
        type: Sequelize.ENUM,
        values: ['rateViaOrderPrice', 'rateViaMiles'],
        allowNull: false,
      },
	valueOver: { type: Sequelize.DECIMAL, allowNull: false },
	deliveryCharges: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
}, {
	timestamps: true,
})

module.exports = DeliveryRates;