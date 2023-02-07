const {validationResult} = require('express-validator');

const userService = require("../services/user.service");
const ApiError = require("../exceptions/api-error");

exports.createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Error during registration', errors.array()))
        }
        const { username, password, email } = req.body;
        const userData = await userService.signup(email, password, username);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        return res.json(userData);
    } catch (e) {
        next(e);
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const userData = await userService.login(username, password);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        return res.json(userData);
    } catch (e) {
        next(e);
    }
}

exports.logout = async (req, res,next) => {
    try {
        const {refreshToken} = req.cookies;
        const token = await userService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.json(token);
    } catch (e) {
        next(e);
    }
}

exports.activate = async (req, res, next) => {
    try {
        const activationLink = req.params.link;
        await userService.activate(activationLink);
        return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
        next(e);
    }
}

exports.refresh = async (req, res, next) => {
    try {
        const {refreshToken} = req.cookies;
        const userData = await userService.refresh(refreshToken);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        return res.json(userData);
    } catch (e) {
        next(e);
    }
}

exports.getUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        return res.json(users);
    } catch (e) {
        next(e);
    }
}