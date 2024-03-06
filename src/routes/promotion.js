var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const promotionController = require('../app/Controllers/promotion.controller');

//***************** Validations **********************/ 
const commonValidators = require('../app/Validators/commonValidators');

const promotionValidator = require('../app/Validators/promotion.validator')

var errorMsgs = commonValidators.responseValidationResults;



router.post('/apply', [promotionValidator.applyPromotion, errorMsgs], promotionController.applyPromotion);

router.post('/addProduct', [promotionValidator.addProduct, errorMsgs], promotionController.addProduct)

router.delete('/removeProduct', [promotionValidator.removeProduct, errorMsgs], promotionController.removeProduct)

router.post('/unAvail', [promotionValidator.unAvail, errorMsgs], promotionController.unAvail)
module.exports = router;
