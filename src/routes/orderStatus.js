var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const orderStatusController = require('../app/Controllers/orderStatus.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const orderStatusValidator = require('../app/Validators/orderStatus')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', orderStatusController.getAll);

router.get('/type', [orderStatusValidator.getOrderStatusByType, errorMsgs], orderStatusController.getOrderStatusByType);

router.get('/:id', [orderStatusValidator.getOne, errorMsgs], orderStatusController.getOne);


router.post('/', [orderStatusValidator.post, errorMsgs], orderStatusController.post);

router.put('/', [orderStatusValidator.update, errorMsgs], orderStatusController.update);

router.delete('/:id', [orderStatusValidator.delete, errorMsgs], orderStatusController.delete);


module.exports = router;
