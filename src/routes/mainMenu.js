var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const mainMenuController = require('../app/Controllers/mainMenu.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const mainMenuValidator = require('../app/Validators/mainMenu')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', mainMenuController.getAll);

router.get('/:id', [mainMenuValidator.getOne, errorMsgs], mainMenuController.getOne);

router.post('/', [mainMenuValidator.post, errorMsgs], mainMenuController.post);

router.put('/', [mainMenuValidator.update, errorMsgs], mainMenuController.update);

router.delete('/:id', [mainMenuValidator.delete, errorMsgs], mainMenuController.delete);


module.exports = router;
