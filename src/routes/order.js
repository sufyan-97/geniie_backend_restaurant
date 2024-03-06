var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require('../app/Controllers/order.controller');


//***************** Validations **********************/ 
const commonValidators = require('../app/Validators/commonValidators');

const validator = require('../app/Validators/order')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', controller.getAll);

router.get('/acceptanceAndCancellationRate', controller.getAcceptanceAndCancellationRate);

router.get('/active', controller.getActiveOrder);

router.put('/updateOrderStatus', [validator.updateOrderStatus, errorMsgs], controller.updateOrderStatus);

router.put('/updateConsumerLocation', [validator.updateConsumerLocation, errorMsgs], controller.updateConsumerLocation);

router.put('/updateDeliveryTime', [validator.updateOrderDeliveryTime, errorMsgs], controller.updateOrderDeliveryTime);

router.get('/pendingReviewOrder', controller.getPendingReviewOrder);

router.get('/:id', controller.getOne);

router.post('/', multipart(), [validator.post, errorMsgs], controller.post);

router.put('/', [validator.put, errorMsgs], controller.put);

// router.put('/', [validator.update, errorMsgs], controller.update);

// router.delete('/:id', [validator.delete, errorMsgs], controller.delete);


module.exports = router;
