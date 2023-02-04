const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {validationResult} = require('express-validator');

const User = require('../models/user.model');
const Role = require('../models/role.model');
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
        const {username, password} = req.body;
        const userData = await userService.login(username, password);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        return res.json(userData);
    } catch (e) {
        next(e);
    }
    // await User.findOne({email: req.body.email}).then(user => {
    //     if (!user) {
    //         return res.status(401).json({
    //             message: 'Auth failed'
    //         });
    //     }
    //     fetchedUser = user;
    //     return bcrypt.compare(req.body.password, user.password);
    // }).then(result => {
    //     if (!result) {
    //         return res.status(401).json({
    //             message: 'Auth failed'
    //         });
    //     }
    //     const token = jwt.sign(
    //         {email: fetchedUser.email, userId: fetchedUser._id},
    //                 process.env.JWT_KEY,
    //         {expiresIn: "1h"}
    //     );
    //     res.status(200).json({
    //         token,
    //         expiresIn: 3600,
    //         userId: fetchedUser._id
    //     })
    // })
    //     .catch(err => {
    //         return res.status(401).json({
    //             message: 'Invalid authentication credentials!'
    //         });
    //     })
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
        console.log(e)
        res.status(400).json({message: 'Get user error'})
        next(e);
    }
}