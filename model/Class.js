const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
    teacherID: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    gradeLevel: {
        type: String,
        required: true
    },
    schoolYear: {
        type: Date,
        required: true
    },
    archive: {
        type: Boolean,
        require: true,
        default: false
    }
});

module.exports = mongoose.model('Class', classSchema)