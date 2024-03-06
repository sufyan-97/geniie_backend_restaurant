var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require('../app/Controllers/restaurantFoodMenuProduct.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const validator = require('../app/Validators/restaurantFoodMenuProduct')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

// router.get('/', controller.getAll);

router.post('/withVariation', [validator.postWithVariation, errorMsgs], controller.postWithVariation);

router.put('/withVariation', [validator.updateWithVariation, errorMsgs], controller.updateWithVariation);

router.post('/', [validator.post, errorMsgs], controller.post);

router.put('/', [validator.update, errorMsgs], controller.update);

router.put('/availability', [validator.updateAvailability, errorMsgs], controller.updateAvailability);

router.delete('/:id', [validator.delete, errorMsgs], controller.delete);


module.exports = router;
