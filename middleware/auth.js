const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req, res, next){

    const token = req.header("Authorization")

    if(!token){
        return res.status(401).json({msg: 'Authorization Denied'})
    }

    try {
        const decoded = jwt.verify(token, config.get('JWTSecret'))
        // console.log(decoded)
        req.user = decoded.user
        req.extra = decoded.extra
        next()
    } catch (err) {
        res.status(401).json({msg: 'Not Valid'})
    }
}

