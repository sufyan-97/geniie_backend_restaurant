var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const favouriteController = require('../app/Controllers/favourite.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const favouriteValidator = require('../app/Validators/favourite')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', favouriteController.getAll);

router.get('/:id', [favouriteValidator.getOne, errorMsgs], favouriteController.getOne);

router.post('/', [favouriteValidator.post, errorMsgs], favouriteController.post);

router.delete('/:id', [favouriteValidator.delete, errorMsgs], favouriteController.delete);


module.exports = router;
