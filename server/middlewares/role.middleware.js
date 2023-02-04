const jwt = require('jsonwebtoken');
const ApiError = require("../exceptions/api-error");

module.exports = (roles) => {
    return (req, res, next) => {
        try {
            const accessToken = req.headers.authorization?.split(' ')[1];
            if (!accessToken) {
                return next(ApiError.UnauthorizedError());
            }
            const { roles: userRoles } = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
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
            return next(ApiError.UnauthorizedError());
        }
    }
}