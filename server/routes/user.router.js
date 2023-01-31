const express = require("express");
const { check } = require('express-validator');
const UserController = require("../controllers/user.controller");
const checkAuth = require('../middlewares/check-auth');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/signup', [
    check('username', "Username cannot be empty").trim().notEmpty(),
    check('password', 'Password should contain more then 4 and less then 10 symbols').trim().isLength({min:4, max: 10}),
    check('email', 'E-mail should be in valid format').trim().isEmail()
], UserController.createUser);

router.post('/login', UserController.loginUser);

router.get('/users', roleMiddleware(['ADMIN']), UserController.getUsers);

module.exports = router;