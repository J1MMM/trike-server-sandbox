const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const franchiseSchema = new Schema({
    "MTOP": {
        type: String,
        required: true
    },
    "LASTNAME": {
        type: String,
        required: false
    },
    "FIRST NAME": {
        type: String,
        required: false
    },
    "MI": {
        type: String,
        required: false
    },
    "ADDRESS": {
        type: String,
        required: false
    },
    "CONTACT NO.": {
        type: String,
        required: false
    },
    "CONTACT NO.2": {
        type: String,
        required: false
    },
    "TO+C2+H1+H4": {
        type: String,
        required: false
    },
    "DRIVER'S NAME": {
        type: String,
        required: false
    },
    "DRIVER'S ADDRESS": {
        type: String,
        required: false
    },
    "O.R.": {
        type: String,
        required: false
    },
    "C.R.": {
        type: String,
        required: false
    },
    "DRIVER'S LICENSE NO.": {
        type: String,
        required: false
    },
    "MODEL": {
        type: String,
        required: false
    },
    "MOTOR NO": {
        type: String,
        required: false
    },
    "CHASSIS NO": {
        type: String,
        required: false
    },
    "PLATE NO": {
        type: String,
        required: false
    },
    "STROKE": {
        type: String,
        required: false
    },
    "DATE": {
        type: String,
        required: false
    },
    "REMARKS": {
        type: String,
        required: false
    },
    "DATE RELEASE OF ST/TP": {
        type: String,
        required: false
    },
    "COMPLAINT": {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Franchise', franchiseSchema)