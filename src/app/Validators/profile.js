const { check, body, param, query } = require('express-validator');


exports.updatePassword = [

    body('currentPassword')
        .notEmpty()
        .isString(),
    body('newPassword')
        .notEmpty()
        .isString(),


];

