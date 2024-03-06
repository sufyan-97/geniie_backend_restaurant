const { check, body, param, query } = require('express-validator');

// exports.post = [
//     body('name')
//         .notEmpty()
//         .isString(),
// ];

exports.update = [

    // body('userId')
    //     .notEmpty()
    //     .isInt(),

    body('status')
        .notEmpty()
        .isBoolean(),

];