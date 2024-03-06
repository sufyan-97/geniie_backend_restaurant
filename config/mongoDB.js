
const mongoose = require('mongoose');
const constants = require('./constants');

module.exports = function mongoConnection() {
    return new Promise((resolve, reject) => {
        var options = {
            keepAlive: 1,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: constants.MONGO_USERNAME,
            pass: constants.MONGO_PASSWORD,
            authSource: constants.MONGO_AUTH_SOURCE
            // promiseLibrary: global.Promise
        }
        mongoose.connect(`mongodb://${constants.MONGO_HOST}:${constants.MONGO_PORT}/${constants.MONGO_NAME}`, options, function (error) {
            if (error) {
                return reject(error)
            }
            return resolve()
        });
    })
}