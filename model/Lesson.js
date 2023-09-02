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
    filename: {
        type: String,
        required: true
    },
    teacherID: {
        type: String,
        required: true

    }
});

module.exports = mongoose.model('Lesson', lessonSchema)