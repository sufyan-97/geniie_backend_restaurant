try {
	// =============== DotEnv =====================//

	let yamlConfigLib = require('node-yaml-config');

	var env = yamlConfigLib.load(__dirname + `/../config.yaml`);
	// console.log(env);


	// ================ Env List =================== //
	// App Info
	const HOST_NAME = env?.app?.hostName ? env?.app?.hostName : 'localhost';
	const HOST = env?.app?.hostURL ? env?.app?.hostURL : 'http://localhost:3000';

	const APP_ENV = env?.app?.env ? env?.app?.env : 'local'
	const APP_TITLE = env?.app?.title ? env?.app?.title : 'ASAP';
	const APP_PORT = env?.app?.port ? env?.app?.port : 3000;
	const API_VERSION = env?.app?.version ? env?.app?.version : 4.1;

	const TIME_ZONE = env?.app?.timezone ? env?.app?.timezone : 'Europe/London'; // "Asia/Karachi";
	const TIME_ZONE_OFFSET = env?.app?.timezoneOffset ? env?.app?.timezoneOffset : '+0:00';

	const IP_INFO_CHECKER = env?.app?.ipInfoChecker ? env?.app?.ipInfoChecker : 'http://ipinfo.io/';
	const DEFAULT_COUNTRY = env?.app?.defaultCountry ? env?.app?.defaultCountry : 'PK';

	// console.log(env.app);
	// #GRPC
	const RPC_HOST = env?.app?.rpcHost ? env?.app?.rpcHost : 'localhost';
	const RPC_PORT = env?.app?.rpcPort ? env?.app?.rpcPort : 3003

	const MAIN_SERVICE_URL = env?.app?.mainServiceURL ? env?.app?.mainServiceURL : 'http://localhost:3000'
	const MAIN_SERVICE_BASIC_AUTH_USERNAME = env.app.mainServiceBasicAuthUsername ? env.app.mainServiceBasicAuthUsername : 'microservice'
	const MAIN_SERVICE_BASIC_AUTH_PASSWORD = env.app.mainServiceBasicAuthPassword ? env.app.mainServiceBasicAuthPassword : '$2b$10$/WLFcFMKzMfEQuIihaLbKeywt5nr67gO0nhabRT2pRnIaPd0Ivxo6'
	// App Config & Secrets

	// set default utc-1 timezone for testing

	const APP_SECRET = env?.secret?.key ? env?.secret?.key : '';
	const EXPIRE_IN = env?.secret?.expiresIn ? env?.secret?.expiresIn : '';


	// MySQL Database
	const IS_MYSQL = env?.mysql ? env?.mysql?.isMySQL : true

	const DB_HOST = env?.mysql?.host ? env?.mysql?.host : '';
	const DB_NAME = env?.mysql?.name ? env?.mysql?.name : '';
	const DB_USERNAME = env?.mysql?.username ? env?.mysql?.username : '';
	const DB_PASSWORD = env?.mysql?.password ? env?.mysql?.password : '';
	const DB_PORT = env?.mysql?.port ? env?.mysql?.port : '';
	const DB_SSL = env?.mysql?.ssl ? env?.mysql?.ssl : '';

	// MongoDB
	const IS_MONGO = env?.mongo ? env?.mongo?.isMongo : false;
	
	const MONGO_HOST = env?.mongo?.host ? env?.mongo?.host : '';
	const MONGO_NAME = env?.mongo?.name ? env?.mongo?.name : '';
	const MONGO_USERNAME = env?.mongo?.username ? env?.mongo?.username : '';
	const MONGO_PASSWORD = env?.mongo?.password ? env?.mongo?.password : '';
	const MONGO_PORT = env?.mongo?.port ? env?.mongo?.port : '';
	const MONGO_AUTH_SOURCE = env?.mongo?.authSource ? env?.mongo?.authSource : '';

	// Redis Database
	const REDIS_HOST = env?.redis?.host ? env?.redis?.host : ''
	const REDIS_PORT = env?.redis?.port ? env?.redis?.port : ''
	const REDIS_PREFIX = env?.redis?.prefix ? env?.redis?.prefix : ''
	const REDIS_KEY = env?.redis?.key ? env?.redis?.key : ''
	const REDIS_USERNAME = env?.redis?.username ? env?.redis?.username : ''
	const REDIS_PASSWORD = env?.redis?.password ? env?.redis?.password : ''

	const SMTP_HOST = env?.smtp1?.host ? env?.smtp1?.host : '';
	const SMTP_PORT = env?.smtp1?.port ? env?.smtp1?.port : '';
	const SMTP_USERNAME = env?.smtp1?.username ? env?.smtp1?.username : '';
	const SMTP_PASSWORD = env?.smtp1?.password ? env?.smtp1?.password : '';

	// SMTP Credentials2
	const SMTP_HOST2 = env?.smtp2?.host ? env?.smtp2?.host : '';
	const SMTP_PORT2 = env?.smtp2?.port ? env?.smtp2?.port : '';
	const SMTP_USERNAME2 = env?.smtp2?.username ? env?.smtp2?.username : '';
	const SMTP_PASSWORD2 = env?.smtp2?.password ? env?.smtp2?.password : '';

	// SMTP Info
	const SMTP_FROM_EMAIL = env?.smtp1?.fromEmail ? env?.smtp1?.fromEmail : '';
	const SMTP_FROM_EMAIL2 = env?.smtp2?.fromEmail ? env?.smtp2?.fromEmail : '';
	const SMTP_FROM_NAME = env?.smtp1?.fromName ? env?.smtp1?.fromName : '';


	// Twilio
	const TWILIO_SID = env?.twilio?.sid ? env?.twilio?.sid : ''
	const TWILIO_AUTH_TOKEN = env?.twilio?.authToken ? env?.twilio?.authToken : ''
	const TWILIO_OTP_ATTEMPTS = env?.twilio?.optAttempts ? env?.twilio?.optAttempts : '';
	const TWILIO_MESSAGE_SERVICE_ID = env?.twilio?.messageServiceId ? env?.twilio?.messageServiceId : ''

	
	// Plugins
	const RPC_CLIENTS = env.rpcClients

	module.exports = {
		// APP INFO Constants

		HOST_NAME,
		HOST,
		APP_ENV,
		APP_TITLE,
		APP_PORT,
		API_VERSION,
		
		IP_INFO_CHECKER,
		DEFAULT_COUNTRY,

		RPC_HOST,
		RPC_PORT,

		MAIN_SERVICE_URL,

		BASIC_AUTH_USER: MAIN_SERVICE_BASIC_AUTH_USERNAME,
		BASIC_AUTH_PASSWORD: MAIN_SERVICE_BASIC_AUTH_PASSWORD,

		TIME_ZONE,
		TIME_ZONE_OFFSET,

		// App Config & Secrets
		APP_SECRET,
		EXPIRE_IN,




		// MySQL Database
		IS_MYSQL,
		DB_HOST,
		DB_NAME,
		DB_USERNAME,
		DB_PASSWORD,
		DB_PORT,
		DB_SSL,

		// MongoDB
		IS_MONGO,
		MONGO_HOST,
		MONGO_USERNAME,
		MONGO_PASSWORD,
		MONGO_AUTH_SOURCE,
		MONGO_NAME,
		MONGO_PORT,

		// Redis Database
		REDIS_HOST,
		REDIS_PORT,
		REDIS_PREFIX,
		REDIS_KEY,
		REDIS_USERNAME,
		REDIS_PASSWORD,

		// SMTP Constants
		// SMTP Credentials
		SMTP_HOST,
		SMTP_PORT,
		SMTP_USERNAME,
		SMTP_PASSWORD,

		// SMTP Credentials 2
		SMTP_HOST2,
		SMTP_PORT2,
		SMTP_USERNAME2,
		SMTP_PASSWORD2,

		// SMTP Info
		SMTP_FROM_EMAIL,
		SMTP_FROM_EMAIL2,
		SMTP_FROM_NAME,
		SMTP_COMMON_SUBJECT: `${APP_TITLE} -`,


		// Twilio
		TWILIO_SID,
		TWILIO_AUTH_TOKEN,
		TWILIO_OTP_ATTEMPTS,
		TWILIO_MESSAGE_SERVICE_ID,
		
		
		// Plugins
		RPC_CLIENTS
	}
} catch (error) {
	console.log(error);
	process.exit(1)
}
