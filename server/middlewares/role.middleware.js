const jwt = require('jsonwebtoken');
module.exports = (roles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ')[1]; // How we get a token from headers, omit Bearer and get only token
            if (!token) {
                res.status(401).json({
                    message: 'You are not authenticated!'
                });
            }
            const {roles: userRoles} = jwt.verify(token, process.env.JWT_KEY);
            let hasRole = false;
            userRoles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true
                }
            })
            if (!hasRole) {
                res.status(403).json({
                    message: 'You have no access!'
                });
            }
            next();
        } catch (error) {
            console.log(error)
            res.status(401).json({
                message: 'You are not authenticated!'
            });
        }
    }
}