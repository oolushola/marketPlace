const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];    
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'mysuperScretSecret')
    } catch (error) {
        error.statusCode = 500
        throw error
    }
    if(!decodedToken) {
        const err = new Error('Not Authenticated!')
        err.statusCode = 401
        throw err
        console.log('Something went wrong!...')
    }
    req.userId = decodedToken.userId
    //console.log(req)
    next()
}