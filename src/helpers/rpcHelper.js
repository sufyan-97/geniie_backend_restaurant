
const rpcClient = require("../lib/rpcClient");
module.exports = {
	updateRiderOccupyStatus: (status, userId, data = "") => {
		return new Promise((resolve, reject) => {
			rpcClient.riderRPC.updateRiderOccupyStatus(
				{ isOccupied: status, userId, data: JSON.stringify(data) },
				async (error, response) => {
					if (error) {
						console.log(error);
						sequelizeTransaction.rollback();
						return resolve({
							message: "Unable to get riders this time.",
							status: false
						})
					}
					if (!response || !response.status) {
						sequelizeTransaction.rollback();
						return resolve({
							message: "Unable to get riders this time.",
							status: false
						})
					}

					if (!response || !response.userId) {
						return resolve({
							message: "Unable to get riders this time.",
							status: false
						})
					}
					return resolve({
						status: true,
						data: response
					})
				});
		})
	},
	updateOrderStatus: (status, orderId, data = "") => {
		return new Promise((resolve, reject) => {
			let sendData = {
				status,
				orderId
			}
			if (data) {
				sendData.data = JSON.stringify(data)
			}
			rpcClient.riderRPC.updateOrderStatus(
				sendData,
				async (error, response) => {
					if (error) {
						console.log(error);
						sequelizeTransaction.rollback();
						return resolve({
							message: "Unable to update order this time.",
							status: false
						})
					}
					if (!response || !response.status) {
						sequelizeTransaction.rollback();
						return resolve({
							message: "Unable to update order this time.",
							status: false
						})
					}

					// console.log(response)
					return resolve({
						status: true,
						data: response
					})
				});
		})
	},
	refundToWallet: async (data) => {
		return new Promise((resolve, reject) => {
			if (data) {
				data = JSON.stringify(data)
			}
			rpcClient.BillingService.refundToWallet({
				data: data
			}, async (error, resp) => {
				console.log(error, resp)
				if (error) {
					resolve(false)

				}
				if (!resp.status) {
					resolve(false)
				}
				resolve(true)
			})
		})
	},
	assignOrderToRider: (userId, data = "") => {
		return new Promise((resolve, reject) => {
			rpcClient.riderRPC.assignOrderToRider(
				{ userId, data: JSON.stringify(data) },
				async (error, response) => {
					if (error) {
						console.log(error);
						sequelizeTransaction.rollback();
						return resolve({
							message: "Unable to get riders this time.",
							status: false
						})
					}
					if (!response || !response.status) {
						return resolve({
							message: "Unable to get riders this time.",
							status: false
						})
					}

					if (!response || !response.userId) {
						return resolve({
							message: "Unable to get riders this time.",
							status: false
						})
					}
					return resolve({
						status: true,
						data: response
					})
				});
		})
	},
	verifyRestaurantRider: (riderId, userId) => {
		return new Promise((resolve, reject) => {
			rpcClient.UserService.verifyRestaurantRider(
				{ riderId, userId },
				async (error, response) => {
					console.log(error, response)
					if (error) {
						console.log(error);
						return resolve({
							message: "Unable to get riders this time.",
							status: false
						})
					}
					if (!response || !response.status) {
						return resolve({
							message: response ? response.message : "Error: Unable to find active rider.",
							status: false
						})
					}
					return resolve({
						status: true,
						data: response
					})
				});
		})
	},
}