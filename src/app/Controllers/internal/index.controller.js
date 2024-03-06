

const { Op } = require('sequelize')

// Modals
var Cart = require('../../SqlModels/Cart');

exports.update = async function (req, res) {

    let userId = req.body.userId
    let guestUserId = req.body.guestUserId


    Cart.update({ userId }, {
        where: {
            userId: guestUserId
        },
    }).then(data => {
        console.log(data);
        return res.send({
            message: 'Cart has been updated successfully.',
        })
    }).catch(err => {
        console.log(err);
        return res.status(500).send({
            message: 'Internal Server Error.',
        })
    })
}

exports.delete = async function (req, res) {
    let userId = req.params.userId

    Cart.destroy({
        where: {
            userId
        },
    }).then(data => {
        return res.send({
            message: 'Cart has been deleted successfully.',
        })
    }).catch(err => {
        console.log(err);
        return res.status(500).send({
            message: 'Internal Server Error.',
        })
    })
}
