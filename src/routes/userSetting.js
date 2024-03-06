var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const userSettingController = require('../app/Controllers/userSetting.controller')

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');
const userSettingValidator = require('../app/Validators/userSetting')

// const userNotificationSettingValidator = require('../app/Validators/userNotificationSetting')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', userSettingController.getAll);

router.put('/', [userSettingValidator.update, errorMsgs], userSettingController.update);


module.exports = router;
