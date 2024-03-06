var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require('../app/Controllers/review.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const validator = require('../app/Validators/review')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', controller.getAll);

router.get('/:id', controller.getOne);

router.post('/', [validator.post, errorMsgs], controller.post);

// router.put('/', [validator.update, errorMsgs], controller.update);

// router.delete('/:id', [validator.delete, errorMsgs], controller.delete);


module.exports = router;
