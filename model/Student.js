const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  firstname: {
    type: String,
    require: true
  },
  lastname: {
    type: String,
    require: true
  },
  middlename: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  teacherID: {
    type: String,
    require: true
  },
  learning_disabilities: [
    {
      type: String,
      enum: ["dyslexia", "dysgraphia", "dyscalculia"],
      require: true
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    require: true
  },
  stars: {
    type: Number,
    default: 0
  }

});

module.exports = mongoose.model('Student', studentSchema)