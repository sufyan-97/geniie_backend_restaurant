var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const appOrderController = require('../../app/Controllers/app/booking.app.controller');

const controller = require('../../app/Controllers/order.controller');

//***************** Validations **********************/ 

const commonValidators = require('../../app/Validators/commonValidators');

const validator = require('../../app/Validators/booking.app')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', [validator.getAll, errorMsgs], appOrderController.getAll);

router.get('/:id', [validator.getOne, errorMsgs], appOrderController.getOne);

router.put('/', [validator.put, errorMsgs], appOrderController.update);

// router.put('/adjustTime', [validator.adjustTime, errorMsgs], appOrderController.adjustTime);


module.exports = router;
