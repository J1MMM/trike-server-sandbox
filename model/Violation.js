const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const violationSchema = new Schema({
  ticketNo: {
    type: String,
    required: true,
  },
  dateApprehension: {
    type: "date",
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
    type: Number,
    required: false,
  },
  or: {
    type: String,
    required: false,
  },
  ortf: {
    type: String,
    required: false,
  },
  orDate: {
    type: "date",
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
  others: {
    type: String,
    required: false,
  },
  payor: {
    type: String,
    required: false,
  },
  receiptNo: {
    type: String,
    required: false,
  },
  collectingOfficer: {
    type: String,
    required: false,
  },
  datePaid: {
    type: "date",
    required: false,
  },
});

module.exports = mongoose.model("Violation", violationSchema);
