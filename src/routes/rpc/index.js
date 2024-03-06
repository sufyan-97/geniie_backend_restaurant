// Libraries
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Constants
const constants = require('../../../config/constants')

// RPC
const restaurantAppRpc = require("../../app//Controllers/rpc/app.rpc")
const restaurantRpc = require("../../app//Controllers/rpc/restaurant.rpc")


// Controller
const orderRpcController = require("../../app/Controllers/order.controller");
const { confirmBooking } = require('../../app/Controllers/booking.controller');
const restaurantController = require('../../app/Controllers/restaurant.controller')


// Definitions 
const orderDefinition = protoLoader.loadSync(path.join(__dirname, '../../protos/order.proto'), {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});

const restaurantAppDefinition = protoLoader.loadSync(path.join(__dirname, '../../protos/restaurantApp.proto'), {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});

const restaurantDefinition = protoLoader.loadSync(path.join(__dirname, '../../protos/restaurant.proto'), {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});

const riderDefinition = protoLoader.loadSync(path.join(__dirname, '../../protos/rider.proto'), {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});



// Load Service

const orderPackage = grpc.loadPackageDefinition(orderDefinition);
const restaurantPackage = grpc.loadPackageDefinition(restaurantDefinition);
const restaurantAppPackage = grpc.loadPackageDefinition(restaurantAppDefinition);
const riderAppPackage = grpc.loadPackageDefinition(riderDefinition);


/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
var server = new grpc.Server();

server.bindAsync(`${constants.RPC_HOST}:${constants.RPC_PORT}`, grpc.ServerCredentials.createInsecure(), (error) => {
	if (error) {
		console.log(error);
		return process.exit(1)
	}
	console.log(`RPC-server is listening on port: ${constants.RPC_HOST}:${constants.RPC_PORT}`);

	server.addService(orderPackage.OrderRPC.service, {
		sendOrder: orderRpcController.allOrders,
		ConfirmOrder: async function (call, callback) {
			if (call.request.type === 'booking') {
				confirmBooking(call, callback)
			} else {
				orderRpcController.confirmOrder(call, callback)
			}
		},
		VerifyUserOrder: orderRpcController.VerifyUserOrder,
		GetRestaurantOrders: orderRpcController.GetRestaurantOrders,
	});

	server.addService(restaurantPackage.RestaurantService.service, {
		register: restaurantController.store,
		getAllRestaurant: restaurantRpc.getAllRestaurant,
		changeApprovedStatus: restaurantController.changeApprovedStatus,
		changeRestaurantMediaExpiry: restaurantController.changeRestaurantMediaExpiry,
		suspendRestaurants: restaurantController.suspendRestaurants,
		getRestaurantMedia: restaurantController.getRestaurantMedia,
		applyPromo: restaurantRpc.applyPromo
	});

	server.addService(restaurantAppPackage.RestaurantAppService.service, {
		saveLanguageStrings: restaurantAppRpc.saveLanguageStrings,
		getServiceInfo: restaurantAppRpc.getServiceInfo,
	});

	server.addService(riderAppPackage.riderRPC.service, {
		updateRiderOfOrder: orderRpcController.updateRiderOfOrder,
		updateOrderStatusByRIder: orderRpcController.updateOrderStatusByRIder,
		updateAcceptedStatusOfOrder: orderRpcController.updateAcceptedStatusOfOrder,
	});

	server.start();
})

