var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const topDealController = require('../app/Controllers/topDeal.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const topDealValidator = require('../app/Validators/topDeal')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', topDealController.getAll);

router.get('/:id', [topDealValidator.getOne, errorMsgs], topDealController.getOne);


router.post('/', [topDealValidator.post, errorMsgs], topDealController.post);

router.put('/', [topDealValidator.update, errorMsgs], topDealController.update);

router.delete('/:id', [topDealValidator.delete, errorMsgs], topDealController.delete);


module.exports = router;
