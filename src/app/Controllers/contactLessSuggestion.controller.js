//Helper
const { respondWithSuccess, respondWithError } = require('../../helpers/httpHelper')


const { Op } = require('sequelize')

// Modals
var Modal = require('../SqlModels/ContactLessSuggestion');

exports.getAll = async function (req, res) {
    Modal.findAll({
        where:
        {
            deleteStatus: false
        }
    }).then(data => {
        if (data && data.length) {
            return res.send({
                message: 'Data fetched successfully.',
                data: data
            })
        } else {
            return res.status(200).send({
                message: 'Unable to fetch data.',
                data: []
            })
        }
    }).catch(err => {
        console.log(err);
        return respondWithError(req, res, '', null, 500)
    })
}
