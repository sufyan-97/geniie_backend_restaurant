var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const dashboardController = require('../app/Controllers/dashboard.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const dashboardValidator = require('../app/Validators/dashboard')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', dashboardController.getAll);

// router.get('/:id', [dashboardValidator.getOne, errorMsgs], dashboardController.getOne);

// router.post('/', [dashboardValidator.post, errorMsgs], dashboardController.post);

// router.put('/', [dashboardValidator.update, errorMsgs], dashboardController.update);

// router.delete('/:id', [dashboardValidator.delete, errorMsgs], dashboardController.delete);


module.exports = router;
