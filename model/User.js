const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true

    },
    lastname: {
        type: String,
        required: true

    },
    middlename: {
        type: String,
        required: true

    },
    password: {
        type: String,
        required: true

    },
    email: {
        type: String,
        required: true
    },
    refreshToken: String,
    roles: {
        Admin: {
            type: Number,
            default: 2000
        },
        SuperAdmin: Number
    }
});

module.exports = mongoose.model('User', userSchema)