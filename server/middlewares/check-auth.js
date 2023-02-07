const jwt = require("jsonwebtoken");
const ApiError = require('../exceptions/api-error');
const tokenService = require("../services/token.service");

module.exports = (req, res, next) => {
    try {
        const accessToken = req.headers.authorization.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedError());
        }
        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedError());
        }

        const decodedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
        req.userData = { roles: decodedToken.roles, userId: decodedToken.id };
        next();
    } catch (error) {
        return next(ApiError.UnauthorizedError());
    }
}