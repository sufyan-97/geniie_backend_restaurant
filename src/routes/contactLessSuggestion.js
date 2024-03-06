var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

//***************** Controllers **********************/ 
const controller = require('../app/Controllers/contactLessSuggestion.controller');


router.get('/', controller.getAll);


module.exports = router;
