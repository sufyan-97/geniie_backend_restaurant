var express = require('express');
var router = express.Router();;

//***************** Controllers **********************/ 
const restaurantReportController = require('../../app/Controllers/app/restaurantReport.controller');


//***************** Validations **********************/ 

const commonValidators = require('../../app/Validators/commonValidators');

const validator = require('../../app/Validators/restaurantOrder')
var errorMsgs = commonValidators.responseValidationResults;

//***************** Routes **********************/ 

router.get('/', [validator.getAll, errorMsgs],restaurantReportController.getAll);


module.exports = router;
