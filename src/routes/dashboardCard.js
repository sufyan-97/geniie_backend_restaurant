var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const dashboardCardController = require('../app/Controllers/dashboardCard.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const dashboardCardValidator = require('../app/Validators/dashboardCard')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', dashboardCardController.getAll);

router.get('/:id', [dashboardCardValidator.getOne, errorMsgs], dashboardCardController.getOne);


router.post('/', [dashboardCardValidator.post, errorMsgs], dashboardCardController.post);

router.put('/', [dashboardCardValidator.update, errorMsgs], dashboardCardController.update);

router.delete('/:id', [dashboardCardValidator.delete, errorMsgs], dashboardCardController.delete);


module.exports = router;
