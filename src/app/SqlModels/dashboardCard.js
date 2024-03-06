const { sequelize_conn } = require('../../../config/database');
const Sequelize = require('sequelize');

const DashboardCard = sequelize_conn.define('dashboard_cards', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING, allowNull: false },
    slug: { type: Sequelize.STRING, allowNull:true},
    isMain: { type: Sequelize.BOOLEAN, defaultValue: 0 },
    image: { type: Sequelize.TEXT },
    login_required: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 1 },
    deleteStatus: { type: Sequelize.BOOLEAN, defaultValue: 0 },
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async function (item, options) {
            let slug = item.name.replace(/\s/g, `-`);
            item.slug = slug;

            let value = await DashboardCard.findOne({
                where: { slug: slug },
                attributes: ['id']
            });
            if (value) {
                let key = Date.now()
                item.slug = `${slug}-${key}`;
            }

        }
    }
})


module.exports = DashboardCard;