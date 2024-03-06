var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const notificationSettingController = require('../app/Controllers/notificationSetting.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const notificationSettingValidator = require('../app/Validators/notificationSetting')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', notificationSettingController.getAll);

router.get('/:id', [notificationSettingValidator.getOne, errorMsgs], notificationSettingController.getOne);

router.post('/', [notificationSettingValidator.post, errorMsgs], notificationSettingController.post);

router.put('/', [notificationSettingValidator.update, errorMsgs], notificationSettingController.update);

router.delete('/:id', [notificationSettingValidator.delete, errorMsgs], notificationSettingController.delete);


module.exports = router;
