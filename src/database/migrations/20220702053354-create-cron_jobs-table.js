'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.createTable('cron_jobs', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			command: {
				type: Sequelize.STRING,
				allowNull: false
			},
			once: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			}, 
			status: {
				type: Sequelize.ENUM,
				values: ['pending', 'running', 'completed'],
				defaultValue: 'pending',
				allowNull: false
			},

			statusUpdateTime: {
				type: Sequelize.STRING,
				allowNull: true
			},

			interval: {
				type: Sequelize.STRING,
				allowNull: false
			},

			nextScheduled: {
				type: 'TIMESTAMP',
				allowNull: true
			},

			lastExecuted: {
				type: 'TIMESTAMP',
				allowNull: true
			},

			deleteStatus: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			},

			createdAt: {
				type: 'TIMESTAMP',
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			updatedAt: {
				type: 'TIMESTAMP',
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			}
		})
	},

	down: async (queryInterface, Sequelize) => {
	}
};
