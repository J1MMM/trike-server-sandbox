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
    middlename: String,
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
            default: 0
        },
         Teacher: {
            type: Number,
            default: 0
        }
    },
    gender: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    contactNo: {
        type: String,
        require: true
    },
});
// Teacher: 1984        
// Admin: 5150

module.exports = mongoose.model('User', userSchema)