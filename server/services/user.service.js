const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcryptjs');
const uuid = require("uuid");
const mailService = require("./mail.service");
const tokenService = require("./token.service");
const UserDto = require("../dtos/user.dto");
const ApiError = require("../exceptions/api-error");

exports.signup = async (email, password, username) => {
    const candidate = await User.findOne({ email });
    if (candidate) {
        throw ApiError.BadRequest("User with this username already exist");
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

exports.activate = async (activationLint) => {
    const user = await User.findOne({activationLint});
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
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({...userDto});

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto }
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
    const users = await User.find({roles: "USER"}); // TODO work with this logic in future
    return users;
}
