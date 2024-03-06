var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const fileController = require('../app/Controllers/file.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const fileValidator = require('../app/Validators/file')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/:fileName', [fileValidator.getOne, errorMsgs], fileController.getOne);

module.exports = router;
