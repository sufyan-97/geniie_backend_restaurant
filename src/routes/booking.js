// Libraries
var express = require('express');
var router = express.Router();


//***************** Controllers **********************/ 
const controller = require('../app/Controllers/booking.controller');


//***************** Validations **********************/ 
const commonValidators = require('../app/Validators/commonValidators');

const validator = require('../app/Validators/booking')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', controller.getAll);

router.get('/verifyBookingTime', [validator.verifyBookingTime, errorMsgs], controller.verifyBookingTime)

router.get('/active', controller.getActiveBooking);

router.get('/:id', controller.getOne);

router.post('/', [validator.post, errorMsgs], controller.post);

router.put('/', [validator.put, errorMsgs], controller.update);

module.exports = router;
