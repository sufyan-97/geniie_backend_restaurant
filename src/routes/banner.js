var express = require('express');
var router = express.Router();

//***************** Controllers **********************/ 
const bannerController = require('../app/Controllers/banner.controller');

//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const bannerValidator = require('../app/Validators/banner')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */

router.get('/', bannerController.getAll);

router.get('/:id', [bannerValidator.getOne, errorMsgs], bannerController.getOne);


router.post('/', [bannerValidator.post, errorMsgs], bannerController.post);

router.put('/', [bannerValidator.update, errorMsgs], bannerController.update);

router.delete('/:id', [bannerValidator.delete, errorMsgs], bannerController.delete);


module.exports = router;
