var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const internalController = require('../../app/Controllers/internal/index.controller');

//***************** Validations **********************/ 

const commonValidators = require('../../app/Validators/commonValidators');

var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */


router.put('/cart/changeUser', internalController.update);

router.delete('/cart/:userId', internalController.delete);


module.exports = router;
