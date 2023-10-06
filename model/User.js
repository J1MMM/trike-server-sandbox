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
    archive: {
        type: Boolean,
        require: true,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema)