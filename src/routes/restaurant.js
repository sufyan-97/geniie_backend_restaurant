var express = require('express');
var router = express.Router();
// var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require('../app/Controllers/restaurant.controller');
//***************** Validations **********************/ 

const commonValidators = require('../app/Validators/commonValidators');

const validator = require('../app/Validators/restaurant')
var errorMsgs = commonValidators.responseValidationResults;
/* VERIFY EMAIL ROUTER */


router.get('/restaurantApproval', controller.getRestaurantApprovals)
router.put('/restaurantApproval', [validator.changeRestaurantApproval, errorMsgs], controller.changeRestaurantApproval);

router.put('/updateRestaurantRequestRejection', [validator.updateRejectionRequest, errorMsgs], controller.updateRestaurantRequestRejection);

router.get('/userRestaurant', controller.getUserRestaurant);

router.get('/getAllBranches', controller.getAllBranches);

router.get('/:restaurantListTypeId', [validator.getAll, errorMsgs], controller.getAll);

router.get('/:restaurantListTypeId/:id', [validator.getOne, errorMsgs], controller.getOne);

router.post('/', [validator.addRestaurant, errorMsgs], controller.addRestaurant);

router.put('/', [validator.update, errorMsgs], controller.update);

router.put('/edit', [validator.edit, errorMsgs], controller.edit);

router.put('/superAdmin', [validator.editBySuperAdmin, errorMsgs], controller.editBySuperAdmin);

router.put('/status', [validator.status, errorMsgs], controller.openingStatus);

router.delete('/:id', [validator.delete, errorMsgs], controller.delete);

router.put('/suspend', [validator.suspend, errorMsgs], controller.suspendStatus);


module.exports = router;