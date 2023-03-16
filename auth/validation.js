const { checkUserNamePassword, getEmail } = require('../users/user.controller');

module.exports = {
    checkUserRouter : (req, res, next) => {

        if(!req.get('Authorization'))
        {
            return res.status(401).json()
        }
        else
        {
            // Decode the 'Authorization' header Base64 value
            var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
            var username = credentials[0]
            var password = credentials[1]

            checkUserNamePassword(username, password, (flag) => {

                const id = req.params.id

                if(!flag)
                {
                    return res.status(401).json({
                        message : "Unauthorized"
                    });
                }
                else
                {
                    getEmail(id, (idPresent, email) => {

                        if(idPresent && email === username)
                        {
                            res.status(200)
                            next()
                        }
                        else
                        {
                            return res.status(403).json({
                                message : "Forbidden"
                            })
                        }
                    })
                }
            })
        }
    },

    checkProductRouter : (req, res, next) => {

        if(!req.get('Authorization'))
        {
            return res.status(401).json()
        }
        else
        {
            // Decode the 'Authorization' header Base64 value
            var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
            var username = credentials[0]
            var password = credentials[1]

            checkUserNamePassword(username, password, (flag) => {

                if(!flag)
                {
                    return res.status(401).json({
                        message : "Unauthorized"
                    });
                }
                else
                {
                    res.status(200)
                    next()
                }
            })
        }
    }
}
 