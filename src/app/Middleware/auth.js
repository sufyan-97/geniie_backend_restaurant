

module.exports = (req, res, next) => {
    let user = req.headers['user']
    req.isApp = false

    let splitPoints = req.originalUrl.split('/')
    if (splitPoints[1] === 'app') {
        req.isApp = true
    }

    if (user) {
        req.user = JSON.parse(user)
    }
    return next();
}