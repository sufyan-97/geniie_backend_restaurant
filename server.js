// Express Modules
require("express-group-routes");
var express = require("express");
var app = express();

// Libraries
const expressSwagger = require('express-swagger-generator')(app);
const momentTz = require("moment-timezone");
const rpcClient = require('./src/lib/rpcClient')

const http = require("http");
const path = require('path');
const fs = require('fs');

const compression = require('compression')
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Custom Libraries
const translation = require('./src/lib/translation')

// Config
const swaggerOptions = require('./config/swaggerOptions');


// Middleware
const basicAuth = require('./src/app/Middleware/basicAuth')

// Constants
const constants = require('./config/constants');

// ================== MySQL Configurations ================== //
const { sequelize_conn } = require('./config/database')


// ================== MongoDB Configurations ================== //
const mongoConnection = require('./config/mongoDB')

const models = path.join(__dirname, './src/app/MongoModels');
if (fs.existsSync(models)) {
	fs.readdirSync(models)
		.filter(file => ~file.indexOf('.js'))
		.forEach(file => require(path.join(models, file)));
}


// ================== App Configurations ================== //

app.disable("etag");
app.disable('x-powered-by');

// Set timezone for moment Library
momentTz.tz.setDefault(constants.TIME_ZONE);

// ================== Middleware ================== //
// url logging
app.use(logger("dev"));

// compression
app.use(compression())


// file uploading max length
app.use(express.json({ limit: "1000gb" }));
app.use(express.urlencoded({
	limit: "1000gb",
	extended: false,
	parameterLimit: 100000000
}));

// cookie Parser
app.use(cookieParser());

// Allow headers
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", req.header('origin'));
	res.header('Access-Control-Allow-Credentials', true);

	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, language, geoLocation");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
	res.header("Accept-Encoding", "gzip, sdch");

	if (req.method === "OPTIONS") {
		return res.status(200).json({});
	}

	next();
});

// ================== Passport Configurations ================== //
// var jwtPassport = require('./src/app/Providers/jwtStrategy');
// app.use(jwtPassport.initialize());

// ================== Route Configurations ================== //
app.use('/api-docs', basicAuth, function (req, res, next) {
	next();
})

expressSwagger(swaggerOptions.options);

app.get("/", async function (req, res, next) {
	rpcClient.MainService.BroadcastBranchRegistrationNotification({
		status: true,
		data: "hello"
	}, (error, response)=> {
		console.log(error, response);
		return res.send('Express')

	})

	// res.locals = {
	// 	statusCode: 500,
	// 	message: "world English",
	// 	anyObj: []
	// }
	// next()
});

require("./src/routes/index.js")(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	let responseData = res.locals

	if (!responseData || typeof responseData == 'undefined') {
		return res.status(404).send({ message: 'Not Found' })
	}
	let lngCode = req.headers['language'] ? req.headers['language'] : 'en'
	let statusCode = 200
	// console.log('type of response model is:', typeof responseData, Array.isArray(responseData))

	if (typeof responseData === 'object' && !Array.isArray(responseData)) {
		statusCode = responseData.statusCode
		responseData.message = (responseData.message) ? translation(responseData.message, responseData.message ? responseData.message : '', lngCode) : responseData.message
	}

	return res.status(statusCode).send(responseData)
});

// error handler
app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.send(err);
});

// ================== gRPC Configurations ================== //
require('./src/routes/rpc');


// ================== Server Configurations ================== //
var APP_PORT = normalizePort(constants.APP_PORT);
app.set("port", APP_PORT);

const httpServer = http.createServer(app);


// ================== Cron Jobs ================== //
require("./src/crons/index");


// ================== Database Configurations ================== //
function checkDatabases(isMySQL, isMongo) {
	return new Promise(async function (resolve, reject) {
		try {
			if (isMySQL) {
				await sequelize_conn.authenticate()
			}
			if (isMongo) {
				await mongoConnection()
			}
			return resolve()
		} catch (error) {
			reject(error)
			return
		}
	})
}

checkDatabases(constants.IS_MYSQL, constants.IS_MONGO).then(function (dbConnected) {
	startServer()
}).catch(error => {
	console.log(error)
	process.exit(1)
})

function startServer() {
	httpServer.listen(APP_PORT);

	httpServer.on("error", function (error) {
		if (error.syscall !== "listen") {
			throw error;
		}

		var bind = typeof APP_PORT === "string" ? `Pipe ${APP_PORT}` : `Port ${APP_PORT}`;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case "EACCES":
				console.error(`${bind} requires elevated privileges`);
				process.exit(1);
			case "EADDRINUSE":
				console.error(`${bind} is already in use`);
				process.exit(1);
			default:
				throw error;
		}
	});

	httpServer.on("listening", function () {
		var addr = httpServer.address();
		var bind = typeof addr === "string" ? `pipe: ${addr}` : `port: ${addr.port}`;
		console.log(`Listening on ${bind}`);

	});
}


/**
 * Normalizing Port with correct Number.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) return val;
	if (port >= 0) return port;
	return false;
}


