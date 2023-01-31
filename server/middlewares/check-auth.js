const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // How we get a token from headers, omit Bearer and get only token
        if (!token) {
            res.status(401).json({
                message: 'You are not authenticated!'
            });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { roles: decodedToken.roles, userId: decodedToken.userId } ;
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({
            message: 'You are not authenticated!'
        });
    }
}