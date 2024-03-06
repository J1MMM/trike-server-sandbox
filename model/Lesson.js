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
    classID: {
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
    categories: [
        {
            type: String,
            enum: ["Dyslexia", "Dysgraphia", "Dyscalculia"],
            require: true
        }
    ],
    archive: {
        type: Boolean,
        require: true,
        default: false
    }
});

module.exports = mongoose.model('Lesson', lessonSchema)