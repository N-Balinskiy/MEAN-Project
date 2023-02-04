const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    roles: [{ type: String, ref: 'Role' }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);