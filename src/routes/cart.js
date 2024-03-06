var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require('../app/Controllers/cart.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const validator = require('../app/Validators/cart')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', [validator.get, errorMsgs] ,controller.getAll);

router.post('/', [validator.post, errorMsgs], controller.post);

router.post('/promo/apply',[validator.applyPromo, errorMsgs], controller.applyPromo);

router.post('/promo/remove', [validator.removePromo, errorMsgs],controller.removePromo);

router.put('/', [validator.update, errorMsgs], controller.update);

router.delete('/:id', [validator.delete, errorMsgs], controller.delete);


module.exports = router;
