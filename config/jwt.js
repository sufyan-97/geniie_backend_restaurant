var redisClient = require('./redis');
var jwtRLib = require('jwt-redis').default;
var jwtr = new jwtRLib(redisClient);

module.exports = jwtr