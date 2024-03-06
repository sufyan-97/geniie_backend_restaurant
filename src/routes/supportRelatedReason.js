var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require('../app/Controllers/SupportRelatedReason.controller');

const commonValidators = require('../app/Validators/commonValidators');

const supportRelatedReasonValidator = require('../app/Validators/supportRelatedReason')
var errorMsgs = commonValidators.responseValidationResults;

router.get('/', [supportRelatedReasonValidator.getAll, errorMsgs], controller.getAll);

router.post('/', [supportRelatedReasonValidator.post, errorMsgs], controller.post);

router.put('/', [supportRelatedReasonValidator.update, errorMsgs], controller.update);

router.delete('/:id', [supportRelatedReasonValidator.delete, errorMsgs], controller.delete);


module.exports = router;
