//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')

// libraries
var fs = require('fs');
var path = require('path');
var mime = require('mime');


// helpers
const general_helpers = require('../../helpers/general_helper');

// Constants
const app_constants = require('../Constants/app.constants');

exports.getOne = async function (req, res) {
    try {
        let fileName = req.params.fileName
        let imagePath = path.join(__dirname, `../../storage/images/${fileName}`)

        if (fs.existsSync(imagePath)) {
            let fileMimeType = mime.getType(imagePath);
            if (app_constants.IMAGE_SUPPORTED_FORMATS.includes(fileMimeType.toLowerCase())) {
                return res.sendFile(imagePath);
            } else {
                return res.status(404).send({
                    status: false,
                    message: "Error: file not found"
                })
            }
        }
    } catch (error) {
        console.log(error);
        return respondWithError(req, res, '', null, 500)
    }
}

