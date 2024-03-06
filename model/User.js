const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Teacher: 1984        
// Admin: 5150

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
        SuperAdmin: {
            type: Number,
            default: 0
        },
        Admin: {
            type: Number,
            default: 0
        },
        CTMO1: {
            type: Number,
            default: 0
        },
        CTMO2: {
            type: Number,
            default: 0
        },
        CTMO3: {
            type: Number,
            default: 0
        },
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
    archive: {
        type: Boolean,
        require: true,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema)