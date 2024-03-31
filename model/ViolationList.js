const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const violationListSchema = new Schema({
  count: {
    type: Number,
    required: true,
  },
  violation: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("ViolationList", violationListSchema);
