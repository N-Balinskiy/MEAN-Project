const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {validationResult} = require('express-validator');

const User = require('../models/user.model');
const Role = require('../models/role.model');

const generateAccessToken = (id, roles) => {
    const payload = {
        id, roles
    }
    return jwt.sign(payload, process.env.JWT_KEY, {expiresIn: "24h"});
}

exports.createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Error during registration', errors})
    }
    const {username, password} = req.body;
    const candidate = await User.findOne({username});
    if (candidate) {
        return res.status(400).json({message: "User with this username already exist"})
    }
    const userRole = await Role.findOne({value: "USER"});

    bcrypt.hash(password, 10).then(hash => {
        const user = new User({
            username,
            email: req.body.email,
            password: hash,
            roles: [userRole.value]
        });
        user.save()
            .then(result => {
                res.status(201).json({message: 'User successfully registered', result})
            })
            .catch(error => {
                console.log(error)
                res.status(500).json({
                    message: 'Invalid authentication credentials!'
                })
            })
    });
}

exports.loginUser = async (req, res) => {
    // let fetchedUser;
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username})
        if (!user) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        const token = generateAccessToken(user._id, user.roles);
        return res.json(token);
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Invalid authentication credentials!'})
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

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Get user error'})
    }
}