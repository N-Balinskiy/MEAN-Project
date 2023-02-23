const jwt = require("jsonwebtoken");
const Token = require("../models/token.model");

exports.generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {expiresIn: "30m"});
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {expiresIn: "30d"});
    return {
        accessToken,
        refreshToken
    }
}

exports.saveToken = async (userId, refreshToken) => {
    const tokenData = await Token.findOne({user: userId})
    if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return tokenData.save();
    }
    const token = await Token.create({user: userId, refreshToken})
    return token;
}

exports.removeToken = async (refreshToken) => {
    const tokenData = await Token.deleteOne({refreshToken});
    return tokenData;
}

exports.validateAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_KEY);
    } catch (e) {
        return null;
    }
}

exports.validateRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_KEY)
    } catch (e) {
        return null;
    }
}

exports.findToken = async (refreshToken) => {
    const tokenData = await Token.findOne({refreshToken});
    return tokenData;
}