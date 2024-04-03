const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const violationSchema = new Schema({
  ticketNo: {
    type: String,
    required: true,
  },
  dateApprehension: {
    type: String,
    required: true,
  },
  confiscatedDL: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  typeVehicle: {
    type: String,
    required: false,
  },
  franchiseNo: {
    type: String,
    required: false,
  },
  plateNo: {
    type: String,
    required: false,
  },
  placeViolation: {
    type: String,
    required: false,
  },
  officer: {
    type: String,
    required: false,
  },
  violation: {
    type: Array,
    required: false,
  },

  remarks: {
    type: String,
    required: false,
  },
  amount: {
    type: String,
    required: false,
  },
  or: {
    type: String,
    required: false,
  },
  orDate: {
    type: String,
    required: false,
  },
  timeViolation: {
    type: String,
    required: false,
  },
  paid: {
    type: Boolean,
    required: false,
  },
});

module.exports = mongoose.model("Violation", violationSchema);
