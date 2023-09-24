const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    teacherID: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    uri: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    category: {
        dyslexia: {
            type: Boolean,
            default: false
        },
         dysgraphia: {
            type: Boolean,
            default: false
        },
        dyscalculia: {
            type: Boolean,
            default: false
        }
    }

});

module.exports = mongoose.model('Lesson', lessonSchema)