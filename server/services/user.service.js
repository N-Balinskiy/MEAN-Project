const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcryptjs');
const uuid = require("uuid");
const mailService = require("./mail.service");
const tokenService = require("./token.service");
const UserDto = require("../dtos/user.dto");
const ApiError = require("../exceptions/api-error");

exports.signup = async (email, password, username) => {
    const checkUserName = await User.findOne({ username });
    const checkUserMail = await User.findOne({ email });
    if (checkUserName || checkUserMail) {
        throw ApiError.BadRequest(`User with this ${checkUserName ? 'username' : 'email'} already exist`);
    }
    const userRole = await Role.findOne({ value: "USER" });

    const hashPassword = await bcrypt.hash(password, 10);

    const activationLink = uuid.v4();

    const user = await User.create({
        username,
        email,
        password: hashPassword,
        activationLink,
        roles: [userRole.value]
    });

    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`);

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto }
}

exports.activate = async (activationLink) => {
    const user = await User.findOne({activationLink});
    if(!user) {
        ApiError.BadRequest('Incorrect activation link');
    }
    user.isActivated = true;

    await user.save();
}

exports.login = async (username, password) => {
    const user = await User.findOne({username});
    if (!user) {
        throw ApiError.BadRequest('User was not found');
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
        throw ApiError.BadRequest('Invalid authentication credentials!');
    }
    if (!user.isActivated) {
        throw ApiError.BadRequest('Account not activated '); // TODO change to another error BadRequest is incorrect
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto, expiresIn: 3600 }
}

exports.logout = async (refreshToken) => {
    return await tokenService.removeToken(refreshToken);
}

exports.refresh = async (refreshToken) => {
    if (!refreshToken) {
        throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
    }

    const user = await User.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto }
}

exports.getAllUsers = async () => {
    const users = await User.find();
    return users;
}
