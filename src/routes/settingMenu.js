var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const settingMenuController = require('../app/Controllers/settingMenu.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const settingMenuValidator = require('../app/Validators/settingMenu')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', settingMenuController.getAll);

router.get('/:id', [settingMenuValidator.getOne, errorMsgs], settingMenuController.getOne);

router.post('/', [settingMenuValidator.post, errorMsgs], settingMenuController.post);

router.put('/', [settingMenuValidator.update, errorMsgs], settingMenuController.update);

router.delete('/:id', [settingMenuValidator.delete, errorMsgs], settingMenuController.delete);


module.exports = router;
