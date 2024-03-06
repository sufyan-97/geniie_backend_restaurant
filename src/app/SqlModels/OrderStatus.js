const { sequelize_conn } = require("../../../config/database");
const Sequelize = require("sequelize");
const DashboardCard = require("./dashboardCard");
// Custom Libraries
const translation = require("../../lib/translation");
// const Order = require('./Order');
// const { Restaurant } = require('./Restaurant')

const OrderStatus = sequelize_conn.define(
  "order_statuses",
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    image: { type: Sequelize.TEXT, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    nameKey: { type: Sequelize.VIRTUAL },
    detail: { type: Sequelize.TEXT, allowNull: false, defaultValue: "" },
    detailKey: { type: Sequelize.VIRTUAL },
    slug: { type: Sequelize.STRING, allowNull: false },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    sortOrder: { type: Sequelize.DECIMAL(10, 6), defaultValue: 0 },
  },
  {
    timestamps: true,
    hooks: {
      afterFind: (instance, options) => {
        if (instance && instance.length > 0) {
          instance.map((instanceItem) => {
            instanceItem.nameKey = instanceItem.name
            instanceItem.detailKey = instanceItem.detail
            instanceItem.detail = translation(instanceItem.detail, instanceItem.detail, options.lngCode ? options.lngCode : "en");
            instanceItem.name = translation(instanceItem.name, instanceItem.name, options.lngCode ? options.lngCode : "en");
          });
        } else if (instance && Object.keys(instance).length > 0) {
          instance.nameKey = instance.name
          instance.detailKey = instance.detail
          instance.detail = translation(instance.detail, instance.detail, options.lngCode ? options.lngCode : "en");
          instance.name = translation(instance.name, instance.name, options.lngCode ? options.lngCode : "en");
        }
        return instance;
      },
    },
  }
);

OrderStatus.belongsToMany(DashboardCard, { through: "order_status_cards" });

// OrderStatus.belongsTo(Order, {foreignKey: 'orderStatus'})

module.exports = OrderStatus;
