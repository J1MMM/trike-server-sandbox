const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Teacher: 1984
// Admin: 5150

const officerSchema = new Schema({
  callsign: {
    type: String,
    required: true,
  },

  firstname: {
    type: String,
    required: true,
  },

  lastname: {
    type: String,
    required: true,
  },
  mi: {
    type: String,
    required: false,
  },

  fullname: {
    type: String,
    required: false,
  },

  apprehended: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("Officer", officerSchema);
